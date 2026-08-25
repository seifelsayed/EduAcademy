<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Assessment\Enums\QuestionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $quiz_id
 * @property QuestionType $type
 * @property string $prompt
 * @property int $points
 */
class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'type',
        'prompt',
        'explanation',
        'answer_key',
        'points',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'type' => QuestionType::class,
            'points' => 'integer',
            'position' => 'integer',
        ];
    }

    /**
     * Shape consumed by the framework-free QuizGrader.
     *
     * @return array{id: int, type: string, points: int, correct_option_ids: array<int, int>, answer_key: string|null}
     */
    public function toGradingArray(): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type->value,
            'points' => $this->points,
            'correct_option_ids' => $this->options
                ->where('is_correct', true)
                ->pluck('id')
                ->map(static fn ($id): int => (int) $id)
                ->values()
                ->all(),
            'answer_key' => $this->answer_key,
        ];
    }

    /** @return BelongsTo<Quiz, $this> */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /** @return HasMany<QuestionOption, $this> */
    public function options(): HasMany
    {
        return $this->hasMany(QuestionOption::class)->orderBy('position');
    }
}
