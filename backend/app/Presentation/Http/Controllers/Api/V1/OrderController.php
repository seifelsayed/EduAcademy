<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Billing\UseCases\CheckoutCourse;
use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Billing\Enums\OrderStatus;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Order;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\EnrollmentResource;
use App\Presentation\Http\Resources\OrderResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly CheckoutCourse $checkout,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->orders->paginateForStudent($this->user($request), $this->perPage($request));

        return ApiResponse::paginated($paginator, OrderResource::class);
    }

    /**
     * Price breakdown shown on the checkout screen before committing.
     */
    public function quote(Request $request, Course $course): JsonResponse
    {
        $quote = $this->checkout->quote($course);

        return ApiResponse::success([
            'list_price_cents' => $quote['list_price']->amountInCents,
            'total_cents' => $quote['total']->amountInCents,
            'discount_percent' => $quote['discount_percent'],
            'currency' => $quote['total']->currency,
        ]);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $validated = $request->validate([
            'payment_method' => ['nullable', 'string', 'max:32'],
        ]);

        $order = $this->checkout->execute(
            $this->user($request),
            $course,
            $validated['payment_method'] ?? null,
        );

        return ApiResponse::created(
            new OrderResource($order->load('course')),
            'Order created. Complete payment to start learning.',
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->assertOwnership($request, $order);

        return ApiResponse::success(new OrderResource($order->load(['course', 'user'])));
    }

    /**
     * Confirms payment and enrols the buyer.
     *
     * In production this is the hook a payment-gateway webhook should call;
     * the buyer-initiated route exists so the platform is usable without
     * gateway credentials.
     */
    public function confirm(Request $request, Order $order): JsonResponse
    {
        $this->assertOwnership($request, $order);

        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:255'],
        ]);

        $result = $this->checkout->markPaid($order, $validated['payment_reference'] ?? null);

        return ApiResponse::success([
            'order' => new OrderResource($result['order']->load('course')),
            'enrollment' => new EnrollmentResource($result['enrollment']->load('course')),
        ], 'Payment confirmed. You are enrolled.');
    }

    // ---------------------------------------------------------------- Admin

    public function adminIndex(Request $request): JsonResponse
    {
        $this->authorize('access-admin');

        $status = OrderStatus::tryFrom($request->string('status')->toString());

        $paginator = $this->orders->paginateAll($status, $this->perPage($request));

        return ApiResponse::paginated($paginator, OrderResource::class, [
            'total_revenue_cents' => $this->orders->totalRevenueCents(),
        ]);
    }

    public function refund(Request $request, Order $order): JsonResponse
    {
        $this->authorize('access-admin');

        return ApiResponse::success(
            new OrderResource($this->checkout->refund($order)),
            'Order refunded.',
        );
    }

    private function assertOwnership(Request $request, Order $order): void
    {
        $user = $this->user($request);

        if ($order->user_id !== $user->id && ! $user->isAdmin()) {
            throw BusinessRuleViolation::forbidden('This order belongs to someone else.', 'order_owner_mismatch');
        }
    }
}
