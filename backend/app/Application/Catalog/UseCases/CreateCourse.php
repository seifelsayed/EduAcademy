<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Application\Catalog\DTOs\CourseData;
use App\Application\Shared\Services\SlugGenerator;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class CreateCourse
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private SlugGenerator $slugs,
    ) {}

    public function execute(User $instructor, CourseData $data): Course
    {
        if (! $instructor->canTeach()) {
            throw BusinessRuleViolation::forbidden(
                'Only instructors can create courses.',
                'not_an_instructor',
            );
        }

        if ($data->title === null || $data->title === '') {
            throw new BusinessRuleViolation('A course needs a title.', 'title_required');
        }

        $attributes = $data->toAttributes();
        $attributes['instructor_id'] = $instructor->id;
        $attributes['slug'] = $this->slugs->unique(
            $data->title,
            fn (string $slug): bool => $this->courses->slugExists($slug),
        );
        $attributes['status'] = CourseStatus::Draft->value;
        $attributes['level'] ??= CourseLevel::AllLevels->value;
        $attributes['currency'] = config('platform.currency', 'USD');
        $attributes['price_cents'] ??= 0;

        $course = $this->courses->create($attributes);

        if ($data->thumbnail !== null) {
            $course = $this->courses->update($course, [
                'thumbnail_path' => $data->thumbnail->store('course-thumbnails', (string) config('platform.uploads.disk')),
            ]);
        }

        return $course->load(['instructor', 'category']);
    }
}
