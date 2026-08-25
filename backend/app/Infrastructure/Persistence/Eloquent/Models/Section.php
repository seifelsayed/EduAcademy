<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Database\Factories\SectionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property int $position
 */
class Section extends Model
{
    /** @use HasFactory<SectionFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
        ];
    }

    protected static function newFactory(): SectionFactory
    {
        return SectionFactory::new();
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** @return HasMany<Lesson, $this> */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }

    public function totalDurationMinutes(): int
    {
        return (int) $this->lessons()->sum('duration_minutes');
    }
}
