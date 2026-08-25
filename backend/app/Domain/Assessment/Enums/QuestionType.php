<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Enums;

enum QuestionType: string
{
    case SingleChoice = 'single_choice';
    case MultipleChoice = 'multiple_choice';
    case TrueFalse = 'true_false';
    case ShortAnswer = 'short_answer';

    /**
     * Whether the question is graded by comparing selected option ids.
     */
    public function isOptionBased(): bool
    {
        return in_array($this, [self::SingleChoice, self::MultipleChoice, self::TrueFalse], true);
    }

    public function allowsMultipleSelections(): bool
    {
        return $this === self::MultipleChoice;
    }

    /**
     * Short answers are compared against a stored answer key, case-insensitively.
     */
    public function isAutoGradable(): bool
    {
        return true;
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }
}
