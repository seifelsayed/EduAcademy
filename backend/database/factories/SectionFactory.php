<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Section>
 */
final class SectionFactory extends Factory
{
    protected $model = Section::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => Str::title(fake()->words(3, true)),
            'description' => fake()->sentence(),
            'position' => 1,
        ];
    }
}
