<?php

declare(strict_types=1);

namespace App\Domain\User\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Instructor = 'instructor';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Instructor => 'Instructor',
            self::Student => 'Student',
        };
    }

    /**
     * Roles allowed to author and manage course content.
     */
    public function canTeach(): bool
    {
        return in_array($this, [self::Admin, self::Instructor], true);
    }

    public function isAdmin(): bool
    {
        return $this === self::Admin;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }

    /**
     * Roles a visitor is allowed to self-select during public registration.
     *
     * @return array<int, string>
     */
    public static function selfAssignable(): array
    {
        return [self::Student->value, self::Instructor->value];
    }
}
