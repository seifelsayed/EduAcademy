<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $lesson_id
 * @property string $title
 * @property int $passing_score
 * @property int|null $max_attempts
 */
class Quiz extends Model
{
    use HasFactory;

    protected $table = 'quizzes';

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'time_limit_minutes',
        'passing_score',
        'max_attempts',
        'shuffle_questions',
        'show_correct_answers',
    ];

    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'passing_score' => 'integer',
            'max_attempts' => 'integer',
            'shuffle_questions' => 'boolean',
            'show_correct_answers' => 'boolean',
        ];
    }

    public function hasAttemptsRemaining(int $usedAttempts): bool
    {
        return $this->max_attempts === null || $usedAttempts < $this->max_attempts;
    }

    public function isTimed(): bool
    {
        return $this->time_limit_minutes !== null && $this->time_limit_minutes > 0;
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /** @return HasMany<Question, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('position');
    }

    /** @return HasMany<QuizAttempt, $this> */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
