<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
final class ReviewFactory extends Factory
{
    protected $model = Review::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'user_id' => User::factory(),
            // Real course ratings skew high, so the seed data should too.
            'rating' => fake()->randomElement([3, 4, 4, 5, 5, 5]),
            'title' => fake()->sentence(5),
            'comment' => fake()->paragraph(),
            'is_approved' => true,
        ];
    }
}
