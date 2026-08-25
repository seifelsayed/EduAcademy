<?php

declare(strict_types=1);

namespace App\Domain\User\Enums;

enum UserStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Pending = 'pending';

    public function canAuthenticate(): bool
    {
        return $this === self::Active;
    }

    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
