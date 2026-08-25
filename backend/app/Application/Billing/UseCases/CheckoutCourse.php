<?php

declare(strict_types=1);

namespace App\Application\Billing\UseCases;

use App\Application\Learning\UseCases\EnrollInCourse;
use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Billing\Enums\OrderStatus;
use App\Domain\Billing\Services\PricingService;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\Shared\ValueObjects\Money;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Order;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Support\Str;

/**
 * Creates the order for a course purchase.
 *
 * Payment capture itself is delegated to a gateway. This project ships with a
 * manual-confirmation flow (`markPaid`) so the platform runs end to end without
 * live payment credentials; swap in a real gateway by calling `markPaid` from
 * its webhook instead of from the controller.
 */
final readonly class CheckoutCourse
{
    public function __construct(
        private OrderRepositoryInterface $orders,
        private EnrollmentRepositoryInterface $enrollments,
        private EnrollInCourse $enroll,
        private PricingService $pricing,
        private TransactionManager $transaction,
    ) {}

    public function execute(User $student, Course $course, ?string $paymentMethod = null): Order
    {
        if (! $course->status->allowsEnrollment()) {
            throw BusinessRuleViolation::forbidden(
                'This course is not available for purchase.',
                'course_not_published',
            );
        }

        if ($course->isOwnedBy($student)) {
            throw BusinessRuleViolation::forbidden('You already own this course.', 'own_course');
        }

        if ($this->enrollments->exists($student, $course)) {
            throw BusinessRuleViolation::conflict(
                'You are already enrolled in this course.',
                'already_enrolled',
            );
        }

        if ($course->isFree()) {
            throw new BusinessRuleViolation(
                'This course is free — enrol directly instead of checking out.',
                'course_is_free',
            );
        }

        $listPrice = $course->price();
        $total = $this->pricing->effectivePrice($listPrice, $course->discountPrice());
        $split = $this->pricing->split($total);

        return $this->orders->create([
            'reference' => $this->generateReference(),
            'user_id' => $student->id,
            'course_id' => $course->id,
            'status' => OrderStatus::Pending->value,
            'amount_cents' => $listPrice->amountInCents,
            'discount_cents' => $listPrice->minus($total)->amountInCents,
            'total_cents' => $total->amountInCents,
            'platform_fee_cents' => $split['platform_fee']->amountInCents,
            'instructor_payout_cents' => $split['instructor_payout']->amountInCents,
            'currency' => $total->currency,
            'payment_method' => $paymentMethod,
        ]);
    }

    /**
     * Settles an order and enrols the buyer. Idempotent: calling it twice on an
     * already-paid order returns the existing enrolment rather than failing.
     *
     * @return array{order: Order, enrollment: Enrollment}
     */
    public function markPaid(Order $order, ?string $paymentReference = null): array
    {
        if ($order->status === OrderStatus::Refunded) {
            throw BusinessRuleViolation::conflict('This order was refunded.', 'order_refunded');
        }

        return $this->transaction->run(function () use ($order, $paymentReference): array {
            if (! $order->isPaid()) {
                $order = $this->orders->update($order, [
                    'status' => OrderStatus::Paid->value,
                    'payment_reference' => $paymentReference,
                    'paid_at' => now(),
                ]);
            }

            $existing = $this->enrollments->findFor($order->user, $order->course);

            $enrollment = $existing ?? $this->enroll->execute($order->user, $order->course, $order);

            return ['order' => $order, 'enrollment' => $enrollment];
        });
    }

    public function refund(Order $order): Order
    {
        if (! $order->status->isRefundable()) {
            throw BusinessRuleViolation::conflict(
                'Only paid orders can be refunded.',
                'order_not_refundable',
                ['status' => $order->status->value],
            );
        }

        return $this->transaction->run(function () use ($order): Order {
            $refunded = $this->orders->update($order, [
                'status' => OrderStatus::Refunded->value,
                'refunded_at' => now(),
            ]);

            // Access ends with the refund.
            $enrollment = $this->enrollments->findFor($order->user, $order->course);

            if ($enrollment !== null) {
                $this->enrollments->update($enrollment, [
                    'status' => EnrollmentStatus::Cancelled->value,
                ]);
            }

            return $refunded;
        });
    }

    private function generateReference(): string
    {
        do {
            $reference = 'ORD-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while ($this->orders->findByReference($reference) !== null);

        return $reference;
    }

    /**
     * Exposed for the checkout summary screen.
     *
     * @return array{list_price: Money, total: Money, discount_percent: int}
     */
    public function quote(Course $course): array
    {
        $listPrice = $course->price();
        $total = $this->pricing->effectivePrice($listPrice, $course->discountPrice());

        return [
            'list_price' => $listPrice,
            'total' => $total,
            'discount_percent' => $this->pricing->discountPercent($listPrice, $course->discountPrice()),
        ];
    }
}
