<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domain\User\Enums\UserRole;
use App\Domain\User\Enums\UserStatus;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
final class UserFactory extends Factory
{
    protected $model = User::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => UserRole::Student->value,
            'status' => UserStatus::Active->value,
            'headline' => fake()->sentence(4),
            'bio' => fake()->paragraph(),
            'locale' => 'en',
            'timezone' => 'UTC',
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): self
    {
        return $this->state(fn (): array => ['role' => UserRole::Admin->value]);
    }

    public function instructor(): self
    {
        return $this->state(fn (): array => [
            'role' => UserRole::Instructor->value,
            'headline' => fake()->randomElement([
                'Senior Software Engineer',
                'Data Scientist & Educator',
                'Product Designer',
                'DevOps Consultant',
            ]),
        ]);
    }

    public function suspended(): self
    {
        return $this->state(fn (): array => ['status' => UserStatus::Suspended->value]);
    }
}
