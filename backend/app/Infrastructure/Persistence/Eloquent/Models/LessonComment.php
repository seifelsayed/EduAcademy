<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $lesson_id
 * @property int $user_id
 * @property int|null $parent_id
 * @property string $body
 */
class LessonComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'user_id',
        'parent_id',
        'body',
        'is_resolved',
    ];

    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
        ];
    }

    /** @return BelongsTo<Lesson, $this> */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /** @return BelongsTo<User, $this> */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<LessonComment, $this> */
    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->oldest();
    }

    /**
     * @param  Builder<LessonComment>  $query
     * @return Builder<LessonComment>
     */
    public function scopeThreads(Builder $query): Builder
    {
        return $query->whereNull('parent_id');
    }
}
