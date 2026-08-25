<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Assessment\Enums\SubmissionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $assignment_id
 * @property int $user_id
 * @property SubmissionStatus $status
 * @property int|null $score
 */
class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id',
        'user_id',
        'graded_by',
        'content',
        'attachments',
        'status',
        'score',
        'feedback',
        'is_late',
        'submitted_at',
        'graded_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => SubmissionStatus::class,
            'attachments' => 'array',
            'score' => 'integer',
            'is_late' => 'boolean',
            'submitted_at' => 'datetime',
            'graded_at' => 'datetime',
        ];
    }

    public function isGraded(): bool
    {
        return $this->status === SubmissionStatus::Graded;
    }

    /**
     * Score as a percentage of the assignment's maximum points.
     */
    public function percentage(int $maxPoints): float
    {
        if ($this->score === null || $maxPoints <= 0) {
            return 0.0;
        }

        return round(($this->score / $maxPoints) * 100, 2);
    }

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<User, $this> */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
