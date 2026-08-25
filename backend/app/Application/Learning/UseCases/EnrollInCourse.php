<?php

declare(strict_types=1);

namespace App\Application\Learning\UseCases;

use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Order;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class EnrollInCourse
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollments,
        private CourseRepositoryInterface $courses,
        private OrderRepositoryInterface $orders,
        private TransactionManager $transaction,
    ) {}

    public function execute(User $student, Course $course, ?Order $order = null): Enrollment
    {
        if (! $course->status->allowsEnrollment()) {
            throw BusinessRuleViolation::forbidden(
                'This course is not open for enrolment.',
                'course_not_published',
            );
        }

        if ($course->isOwnedBy($student)) {
            throw BusinessRuleViolation::forbidden(
                'You cannot enrol in your own course.',
                'own_course',
            );
        }

        if ($this->enrollments->exists($student, $course)) {
            throw BusinessRuleViolation::conflict(
                'You are already enrolled in this course.',
                'already_enrolled',
            );
        }

        // Paid courses require a settled order; free ones enrol straight away.
        if (! $course->isFree() && $order === null && ! $this->orders->hasPaidOrder($student, $course)) {
            throw new BusinessRuleViolation(
                'This course must be purchased before you can enrol.',
                'payment_required',
                402,
                ['price_cents' => $course->effectivePriceCents()],
            );
        }

        return $this->transaction->run(function () use ($student, $course, $order): Enrollment {
            $enrollment = $this->enrollments->create([
                'user_id' => $student->id,
                'course_id' => $course->id,
                'order_id' => $order?->id,
                'status' => EnrollmentStatus::Active->value,
                'progress_percent' => 0,
                'completed_lessons_count' => 0,
                'enrolled_at' => now(),
                'last_accessed_at' => now(),
            ]);

            $this->courses->refreshAggregates($course);

            return $enrollment->load('course');
        });
    }
}
