<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Shared\ValueObjects\Money;
use Database\Factories\CourseFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $instructor_id
 * @property string $title
 * @property string $slug
 * @property CourseStatus $status
 * @property CourseLevel $level
 * @property int $price_cents
 * @property int|null $discount_price_cents
 * @property string $currency
 */
class Course extends Model
{
    /** @use HasFactory<CourseFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'instructor_id',
        'category_id',
        'title',
        'slug',
        'subtitle',
        'description',
        'thumbnail_path',
        'promo_video_url',
        'level',
        'language',
        'status',
        'price_cents',
        'discount_price_cents',
        'currency',
        'requirements',
        'outcomes',
        'target_audience',
        'duration_minutes',
        'lessons_count',
        'sections_count',
        'students_count',
        'rating_avg',
        'rating_count',
        'is_featured',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'level' => CourseLevel::class,
            'status' => CourseStatus::class,
            'requirements' => 'array',
            'outcomes' => 'array',
            'target_audience' => 'array',
            'price_cents' => 'integer',
            'discount_price_cents' => 'integer',
            'duration_minutes' => 'integer',
            'lessons_count' => 'integer',
            'sections_count' => 'integer',
            'students_count' => 'integer',
            'rating_avg' => 'float',
            'rating_count' => 'integer',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function newFactory(): CourseFactory
    {
        return CourseFactory::new();
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ------------------------------------------------------------- Behaviour

    public function price(): Money
    {
        return Money::fromCents($this->price_cents, $this->currency);
    }

    public function discountPrice(): ?Money
    {
        return $this->discount_price_cents === null
            ? null
            : Money::fromCents($this->discount_price_cents, $this->currency);
    }

    public function isFree(): bool
    {
        return $this->effectivePriceCents() === 0;
    }

    public function effectivePriceCents(): int
    {
        if ($this->discount_price_cents !== null && $this->price_cents !== null && $this->discount_price_cents < $this->price_cents) {
            return (int) $this->discount_price_cents;
        }

        return (int) ($this->price_cents ?? 0);
    }

    public function isPublished(): bool
    {
        return $this->status === CourseStatus::Published;
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->instructor_id === $user->id;
    }

    public function thumbnailUrl(): ?string
    {
        if ($this->thumbnail_path === null) {
            return null;
        }

        return Storage::disk((string) config('platform.uploads.disk'))->url($this->thumbnail_path);
    }

    // --------------------------------------------------------- Relationships

    /** @return BelongsTo<User, $this> */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<Section, $this> */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('position');
    }

    /** @return HasMany<Lesson, $this> */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('position');
    }

    /** @return HasMany<Enrollment, $this> */
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    /** @return HasMany<Review, $this> */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** @return HasMany<Order, $this> */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** @return HasMany<Announcement, $this> */
    public function announcements(): HasMany
    {
        return $this->hasMany(Announcement::class)->latest();
    }

    /** @return HasManyThrough<Quiz, Lesson, $this> */
    public function quizzes(): HasManyThrough
    {
        return $this->hasManyThrough(Quiz::class, Lesson::class);
    }

    // -------------------------------------------------------------- Scopes

    /**
     * @param  Builder<Course>  $query
     * @return Builder<Course>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', CourseStatus::Published->value)
            ->whereNotNull('published_at');
    }

    /**
     * @param  Builder<Course>  $query
     * @return Builder<Course>
     */
    public function scopeOwnedBy(Builder $query, int $instructorId): Builder
    {
        return $query->where('instructor_id', $instructorId);
    }
}
