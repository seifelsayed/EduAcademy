<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Learning\Enums\EnrollmentStatus;
use Database\Factories\EnrollmentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $user_id
 * @property int $course_id
 * @property EnrollmentStatus $status
 * @property float $progress_percent
 */
class Enrollment extends Model
{
    /** @use HasFactory<EnrollmentFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'order_id',
        'last_lesson_id',
        'status',
        'progress_percent',
        'completed_lessons_count',
        'enrolled_at',
        'last_accessed_at',
        'completed_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => EnrollmentStatus::class,
            'progress_percent' => 'float',
            'completed_lessons_count' => 'integer',
            'enrolled_at' => 'datetime',
            'last_accessed_at' => 'datetime',
            'completed_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    protected static function newFactory(): EnrollmentFactory
    {
        return EnrollmentFactory::new();
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function grantsAccess(): bool
    {
        return $this->status->grantsAccess() && ! $this->isExpired();
    }

    public function isCompleted(): bool
    {
        return $this->status === EnrollmentStatus::Completed;
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lastLesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'last_lesson_id');
    }

    /** @return HasMany<LessonProgress, $this> */
    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    /** @return HasOne<Certificate, $this> */
    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    /**
     * @param  Builder<Enrollment>  $query
     * @return Builder<Enrollment>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', EnrollmentStatus::Active->value);
    }
}
