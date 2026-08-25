<?php

declare(strict_types=1);

namespace App\Domain\Learning\Enums;

enum EnrollmentStatus: string
{
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    public function grantsAccess(): bool
    {
        return in_array($this, [self::Active, self::Completed], true);
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
