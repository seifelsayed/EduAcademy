<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $course_id
 * @property int $user_id
 * @property int $rating
 * @property bool $is_approved
 */
class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'course_id',
        'user_id',
        'rating',
        'title',
        'comment',
        'is_approved',
        'instructor_reply',
        'replied_at',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_approved' => 'boolean',
            'replied_at' => 'datetime',
        ];
    }

    protected static function newFactory(): ReviewFactory
    {
        return ReviewFactory::new();
    }

    /** @return BelongsTo<Course, $this> */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @param  Builder<Review>  $query
     * @return Builder<Review>
     */
    public function scopeApproved(Builder $query): Builder
    {
        return $query->where('is_approved', true);
    }
}
