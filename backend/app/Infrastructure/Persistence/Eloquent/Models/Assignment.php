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
 * @property int $max_points
 * @property \Illuminate\Support\Carbon|null $due_at
 * @property bool $allow_late_submissions
 */
class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'instructions',
        'attachments',
        'max_points',
        'due_at',
        'allow_late_submissions',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
            'max_points' => 'integer',
            'due_at' => 'datetime',
            'allow_late_submissions' => 'boolean',
        ];
    }

    public function isOverdue(): bool
    {
        return $this->due_at !== null && $this->due_at->isPast();
    }

    /**
     * Whether a learner may still submit right now.
     */
    public function acceptsSubmissions(): bool
    {
        return ! $this->isOverdue() || $this->allow_late_submissions;
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /** @return HasMany<Submission, $this> */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
