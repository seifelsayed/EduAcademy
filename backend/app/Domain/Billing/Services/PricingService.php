<?php

declare(strict_types=1);

namespace App\Domain\Billing\Services;

use App\Domain\Shared\ValueObjects\Money;

/**
 * Works out what a learner actually pays and how the money is split.
 */
final class PricingService
{
    public function __construct(
        private readonly float $commissionRate = 0.20,
    ) {}

    public static function fromConfig(): self
    {
        return new self((float) config('platform.commission_rate', 0.20));
    }

    /**
     * The effective price: the discounted price when one is set and lower.
     */
    public function effectivePrice(Money $price, ?Money $discountPrice): Money
    {
        if ($discountPrice === null) {
            return $price;
        }

        return $discountPrice->amountInCents < $price->amountInCents ? $discountPrice : $price;
    }

    public function discountPercent(Money $price, ?Money $discountPrice): int
    {
        if ($discountPrice === null || $price->isFree() || $discountPrice->amountInCents >= $price->amountInCents) {
            return 0;
        }

        $saved = $price->amountInCents - $discountPrice->amountInCents;

        return (int) round(($saved / $price->amountInCents) * 100);
    }

    public function platformFee(Money $total): Money
    {
        return $total->multipliedBy($this->commissionRate);
    }

    public function instructorPayout(Money $total): Money
    {
        return $total->minus($this->platformFee($total));
    }

    /**
     * @return array{total: Money, platform_fee: Money, instructor_payout: Money}
     */
    public function split(Money $total): array
    {
        $fee = $this->platformFee($total);

        return [
            'total' => $total,
            'platform_fee' => $fee,
            'instructor_payout' => $total->minus($fee),
        ];
    }
}
