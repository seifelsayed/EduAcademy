<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
final class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() === true;

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status?->value ?? (is_string($this->status) ? $this->status : 'pending'),
            'amount_cents' => $this->amount_cents,

            'discount_cents' => $this->discount_cents,
            'total_cents' => $this->total_cents,
            'currency' => $this->currency,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'refunded_at' => $this->refunded_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),

            // The revenue split is internal accounting.
            'platform_fee_cents' => $this->when($isAdmin, $this->platform_fee_cents),
            'instructor_payout_cents' => $this->when($isAdmin, $this->instructor_payout_cents),

            'course' => $this->whenLoaded('course', fn () => $this->course ? new CourseResource($this->course) : null),
            'buyer' => $this->whenLoaded('user', fn () => $this->user ? new UserResource($this->user) : null),
        ];
    }
}
