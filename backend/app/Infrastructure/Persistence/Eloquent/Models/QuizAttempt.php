<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Assessment\Enums\AttemptStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $quiz_id
 * @property int $user_id
 * @property AttemptStatus $status
 * @property float $score
 * @property bool $passed
 */
class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'user_id',
        'status',
        'attempt_number',
        'score',
        'earned_points',
        'total_points',
        'correct_count',
        'question_count',
        'passed',
        'started_at',
        'expires_at',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => AttemptStatus::class,
            'score' => 'float',
            'earned_points' => 'integer',
            'total_points' => 'integer',
            'correct_count' => 'integer',
            'question_count' => 'integer',
            'attempt_number' => 'integer',
            'passed' => 'boolean',
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function hasTimedOut(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isOpen(): bool
    {
        return $this->status === AttemptStatus::InProgress && ! $this->hasTimedOut();
    }

    /** @return BelongsTo<Quiz, $this> */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<QuizAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(QuizAnswer::class);
    }
}
