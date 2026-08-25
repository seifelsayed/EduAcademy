<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum CourseStatus: string
{
    case Draft = 'draft';
    case PendingReview = 'pending_review';
    case Published = 'published';
    case Archived = 'archived';

    public function isVisibleToPublic(): bool
    {
        return $this === self::Published;
    }

    public function allowsEnrollment(): bool
    {
        return $this === self::Published;
    }

    /**
     * Whether the author may still edit the curriculum structure freely.
     */
    public function isEditable(): bool
    {
        return in_array($this, [self::Draft, self::PendingReview], true);
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
