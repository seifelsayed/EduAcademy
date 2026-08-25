<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Catalog\Enums\LessonType;
use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $course_id
 * @property int $section_id
 * @property string $title
 * @property LessonType $type
 * @property bool $is_preview
 * @property int $position
 */
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'section_id',
        'title',
        'slug',
        'type',
        'content',
        'video_url',
        'video_provider',
        'video_duration_seconds',
        'duration_minutes',
        'attachments',
        'position',
        'is_preview',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'type' => LessonType::class,
            'attachments' => 'array',
            'video_duration_seconds' => 'integer',
            'duration_minutes' => 'integer',
            'position' => 'integer',
            'is_preview' => 'boolean',
            'is_published' => 'boolean',
        ];
    }

    protected static function newFactory(): LessonFactory
    {
        return LessonFactory::new();
    }

    /**
     * Free preview lessons are viewable without an enrolment.
     */
    public function isFreelyViewable(): bool
    {
        return $this->is_preview && $this->is_published;
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** @return BelongsTo<Section, $this> */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /** @return HasOne<Quiz, $this> */
    public function quiz(): HasOne
    {
        return $this->hasOne(Quiz::class);
    }

    /** @return HasOne<Assignment, $this> */
    public function assignment(): HasOne
    {
        return $this->hasOne(Assignment::class);
    }

    /** @return HasMany<LessonProgress, $this> */
    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    /** @return HasMany<LessonComment, $this> */
    public function comments(): HasMany
    {
        return $this->hasMany(LessonComment::class);
    }

    /**
     * @param  Builder<Lesson>  $query
     * @return Builder<Lesson>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
