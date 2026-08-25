<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domain\Catalog\Enums\LessonType;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Lesson>
 */
final class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = Str::title(fake()->words(4, true));
        $minutes = fake()->numberBetween(3, 25);

        return [
            'section_id' => Section::factory(),
            'course_id' => fn (array $attributes): int => Section::find($attributes['section_id'])->course_id,
            'title' => $title,
            'slug' => Str::slug($title).'-'.Str::lower(Str::random(4)),
            'type' => LessonType::Video->value,
            'video_url' => 'https://www.youtube.com/watch?v='.Str::random(11),
            'video_provider' => 'youtube',
            'video_duration_seconds' => $minutes * 60,
            'duration_minutes' => $minutes,
            'position' => 1,
            'is_preview' => false,
            'is_published' => true,
        ];
    }

    public function article(): self
    {
        return $this->state(fn (): array => [
            'type' => LessonType::Article->value,
            'content' => fake()->paragraphs(6, true),
            'video_url' => null,
            'video_provider' => null,
            'video_duration_seconds' => null,
        ]);
    }

    public function quiz(): self
    {
        return $this->state(fn (): array => [
            'type' => LessonType::Quiz->value,
            'video_url' => null,
            'video_provider' => null,
            'video_duration_seconds' => null,
            'duration_minutes' => 10,
        ]);
    }

    public function assignment(): self
    {
        return $this->state(fn (): array => [
            'type' => LessonType::Assignment->value,
            'video_url' => null,
            'video_provider' => null,
            'video_duration_seconds' => null,
            'duration_minutes' => 30,
        ]);
    }

    public function preview(): self
    {
        return $this->state(fn (): array => ['is_preview' => true]);
    }
}
