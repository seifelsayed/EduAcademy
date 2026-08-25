<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $enrollment_id
 * @property int $lesson_id
 * @property bool $is_completed
 * @property int $watched_seconds
 */
class LessonProgress extends Model
{
    use HasFactory;

    protected $table = 'lesson_progress';

    protected $fillable = [
        'enrollment_id',
        'lesson_id',
        'is_completed',
        'watched_seconds',
        'last_position_seconds',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'is_completed' => 'boolean',
            'watched_seconds' => 'integer',
            'last_position_seconds' => 'integer',
            'completed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Enrollment, $this> */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
