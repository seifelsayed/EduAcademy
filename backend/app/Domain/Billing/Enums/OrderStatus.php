<?php

declare(strict_types=1);

namespace App\Domain\Billing\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
    case Refunded = 'refunded';

    public function grantsEnrollment(): bool
    {
        return $this === self::Paid;
    }

    public function isRefundable(): bool
    {
        return $this === self::Paid;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
