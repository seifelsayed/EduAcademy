<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Enums;

enum SubmissionStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Graded = 'graded';
    case ReturnedForRevision = 'returned_for_revision';

    public function isEditableByStudent(): bool
    {
        return in_array($this, [self::Draft, self::ReturnedForRevision], true);
    }

    public function isGradable(): bool
    {
        return $this === self::Submitted;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
