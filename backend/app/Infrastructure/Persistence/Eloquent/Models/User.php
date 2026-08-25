<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Models;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property UserStatus $status
 * @property string|null $avatar_path
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'avatar_path',
        'headline',
        'bio',
        'website',
        'social_links',
        'locale',
        'timezone',
        'email_verified_at',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'status' => UserStatus::class,
            'social_links' => 'array',
        ];
    }

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    // ----------------------------------------------------------------- Roles

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isInstructor(): bool
    {
        return $this->role === UserRole::Instructor;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Student;
    }

    public function canTeach(): bool
    {
        return $this->role->canTeach();
    }

    public function isActive(): bool
    {
        return $this->status->canAuthenticate();
    }

    public function avatarUrl(): ?string
    {
        if ($this->avatar_path === null) {
            return null;
        }

        return Storage::disk((string) config('platform.uploads.disk'))->url($this->avatar_path);
    }

    // --------------------------------------------------------- Relationships

    /** @return HasMany<Course, $this> */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
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

    /** @return HasMany<Certificate, $this> */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    /** @return HasMany<QuizAttempt, $this> */
    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /** @return HasMany<Submission, $this> */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /** @return HasMany<Wishlist, $this> */
    public function wishlist(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }
}
