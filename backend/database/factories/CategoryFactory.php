<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
final class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'icon' => fake()->randomElement(['code', 'chart-line', 'palette', 'briefcase', 'camera']),
            'color' => fake()->randomElement(['blue', 'green', 'purple', 'orange', 'red']),
            'position' => fake()->numberBetween(0, 20),
            'is_active' => true,
        ];
    }
}
