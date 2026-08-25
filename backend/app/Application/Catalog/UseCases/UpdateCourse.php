<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Application\Catalog\DTOs\CourseData;
use App\Application\Shared\Services\SlugGenerator;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Support\Facades\Storage;

final readonly class UpdateCourse
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private SlugGenerator $slugs,
    ) {}

    public function execute(Course $course, CourseData $data): Course
    {
        $attributes = $data->toAttributes();

        if (isset($attributes['discount_price_cents'], $attributes['price_cents'])
            && $attributes['discount_price_cents'] > $attributes['price_cents']) {
            throw new BusinessRuleViolation(
                'The discounted price cannot exceed the regular price.',
                'invalid_discount',
                422,
                ['field' => 'discount_price'],
            );
        }

        // Re-slug only when the title actually changes, so existing links keep
        // working through ordinary edits.
        if ($data->title !== null && $data->title !== $course->title) {
            $attributes['slug'] = $this->slugs->unique(
                $data->title,
                fn (string $slug): bool => $this->courses->slugExists($slug, $course->id),
            );
        }

        if ($data->thumbnail !== null) {
            $disk = (string) config('platform.uploads.disk');

            if ($course->thumbnail_path !== null) {
                Storage::disk($disk)->delete($course->thumbnail_path);
            }

            $attributes['thumbnail_path'] = $data->thumbnail->store('course-thumbnails', $disk);
        }

        return $this->courses->update($course, $attributes)->load(['instructor', 'category']);
    }
}
