<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Course>
 */
final class CourseFactory extends Factory
{
    protected $model = Course::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->unique()->words(4, true));
        $price = fake()->randomElement([0, 1999, 2999, 4999, 7999, 12999]);

        return [
            'instructor_id' => User::factory()->instructor(),
            'category_id' => Category::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
            'subtitle' => fake()->sentence(8),
            'description' => fake()->paragraphs(4, true),
            'level' => fake()->randomElement(CourseLevel::values()),
            'language' => 'English',
            'status' => CourseStatus::Draft->value,
            'price_cents' => $price,
            'discount_price_cents' => $price > 0 && fake()->boolean(40)
                ? (int) round($price * 0.6)
                : null,
            'currency' => 'USD',
            'requirements' => fake()->sentences(3),
            'outcomes' => fake()->sentences(5),
            'target_audience' => fake()->sentences(2),
        ];
    }

    public function published(): self
    {
        return $this->state(fn (): array => [
            'status' => CourseStatus::Published->value,
            'published_at' => fake()->dateTimeBetween('-1 year'),
            'thumbnail_path' => null,
        ]);
    }

    public function free(): self
    {
        return $this->state(fn (): array => [
            'price_cents' => 0,
            'discount_price_cents' => null,
        ]);
    }

    public function featured(): self
    {
        return $this->state(fn (): array => ['is_featured' => true]);
    }

    public function for_instructor(User $instructor): self
    {
        return $this->state(fn (): array => ['instructor_id' => $instructor->id]);
    }
}
