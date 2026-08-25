<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum LessonType: string
{
    case Video = 'video';
    case Article = 'article';
    case Quiz = 'quiz';
    case Assignment = 'assignment';
    case Resource = 'resource';

    /**
     * Lessons whose completion is driven by an assessment result rather than
     * by the learner simply marking them as done.
     */
    public function isAssessment(): bool
    {
        return in_array($this, [self::Quiz, self::Assignment], true);
    }

    public function requiresContentBody(): bool
    {
        return $this === self::Article;
    }

    public function requiresMedia(): bool
    {
        return in_array($this, [self::Video, self::Resource], true);
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
