<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;

final readonly class PublishCourse
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private LessonRepositoryInterface $lessons,
    ) {}

    /**
     * A course must be genuinely complete before learners can see it.
     */
    public function execute(Course $course): Course
    {
        $problems = $this->readinessProblems($course);

        if ($problems !== []) {
            throw new BusinessRuleViolation(
                'This course is not ready to publish yet.',
                'course_not_publishable',
                422,
                ['problems' => $problems],
            );
        }

        $this->courses->refreshAggregates($course);

        return $this->courses->update($course, [
            'status' => CourseStatus::Published->value,
            'published_at' => $course->published_at ?? now(),
        ]);
    }

    public function unpublish(Course $course): Course
    {
        return $this->courses->update($course, [
            'status' => CourseStatus::Draft->value,
        ]);
    }

    public function archive(Course $course): Course
    {
        return $this->courses->update($course, [
            'status' => CourseStatus::Archived->value,
        ]);
    }

    public function submitForReview(Course $course): Course
    {
        $problems = $this->readinessProblems($course);

        if ($problems !== []) {
            throw new BusinessRuleViolation(
                'This course is not ready for review yet.',
                'course_not_publishable',
                422,
                ['problems' => $problems],
            );
        }

        return $this->courses->update($course, [
            'status' => CourseStatus::PendingReview->value,
        ]);
    }

    /**
     * @return array<int, string>
     */
    public function readinessProblems(Course $course): array
    {
        $problems = [];

        if (blank($course->description)) {
            $problems[] = 'Add a course description.';
        }

        if ($course->thumbnail_path === null) {
            $problems[] = 'Upload a course thumbnail.';
        }

        if ($course->category_id === null) {
            $problems[] = 'Choose a category.';
        }

        if (blank($course->outcomes)) {
            $problems[] = 'List at least one learning outcome.';
        }

        if ($course->sections()->count() === 0) {
            $problems[] = 'Add at least one section.';
        }

        if ($this->lessons->countForCourse($course) === 0) {
            $problems[] = 'Add at least one published lesson.';
        }

        return $problems;
    }
}
