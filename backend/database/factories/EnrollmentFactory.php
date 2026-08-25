<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
final class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $enrolledAt = fake()->dateTimeBetween('-6 months');

        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'status' => EnrollmentStatus::Active->value,
            'progress_percent' => 0,
            'completed_lessons_count' => 0,
            'enrolled_at' => $enrolledAt,
            'last_accessed_at' => fake()->dateTimeBetween($enrolledAt),
        ];
    }

    public function completed(): self
    {
        return $this->state(fn (): array => [
            'status' => EnrollmentStatus::Completed->value,
            'progress_percent' => 100,
            'completed_at' => now(),
        ]);
    }

    public function inProgress(float $percent = 45.0): self
    {
        return $this->state(fn (): array => [
            'status' => EnrollmentStatus::Active->value,
            'progress_percent' => $percent,
        ]);
    }
}
