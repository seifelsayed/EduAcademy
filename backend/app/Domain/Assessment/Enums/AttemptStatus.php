<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Enums;

enum AttemptStatus: string
{
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Abandoned = 'abandoned';

    public function isFinal(): bool
    {
        return $this !== self::InProgress;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
