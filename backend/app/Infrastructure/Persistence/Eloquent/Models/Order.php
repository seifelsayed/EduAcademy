<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Billing\Enums\OrderStatus;
use App\Domain\Shared\ValueObjects\Money;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $reference
 * @property OrderStatus $status
 * @property int $total_cents
 * @property string $currency
 */
class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'user_id',
        'course_id',
        'status',
        'amount_cents',
        'discount_cents',
        'total_cents',
        'platform_fee_cents',
        'instructor_payout_cents',
        'currency',
        'payment_method',
        'payment_reference',
        'paid_at',
        'refunded_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'amount_cents' => 'integer',
            'discount_cents' => 'integer',
            'total_cents' => 'integer',
            'platform_fee_cents' => 'integer',
            'instructor_payout_cents' => 'integer',
            'meta' => 'array',
            'paid_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'reference';
    }

    public function total(): Money
    {
        return Money::fromCents($this->total_cents, $this->currency);
    }

    public function isPaid(): bool
    {
        return $this->status === OrderStatus::Paid;
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function scopePaid(Builder $query): Builder
    {
        return $query->where('status', OrderStatus::Paid->value);
    }
}
