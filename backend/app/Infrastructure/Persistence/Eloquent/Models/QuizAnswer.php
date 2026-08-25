<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $quiz_attempt_id
 * @property int $question_id
 * @property array<int, int>|null $selected_option_ids
 * @property bool $is_correct
 */
class QuizAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_attempt_id',
        'question_id',
        'selected_option_ids',
        'text_answer',
        'is_correct',
        'earned_points',
    ];

    protected function casts(): array
    {
        return [
            'selected_option_ids' => 'array',
            'is_correct' => 'boolean',
            'earned_points' => 'integer',
        ];
    }

    /** @return BelongsTo<QuizAttempt, $this> */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class, 'quiz_attempt_id');
    }

    /** @return BelongsTo<Question, $this> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
