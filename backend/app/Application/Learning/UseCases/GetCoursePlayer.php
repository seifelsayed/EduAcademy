<?php

declare(strict_types=1);

namespace App\Application\Learning\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Contracts\LessonProgressRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\User;

/**
 * Assembles everything the course player screen needs in one round trip:
 * curriculum, the learner's per-lesson progress, and navigation pointers.
 */
final readonly class GetCoursePlayer
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private LessonProgressRepositoryInterface $progress,
        private LessonRepositoryInterface $lessons,
    ) {}

    /**
     * @return array{
     *     course: Course,
     *     enrollment: Enrollment,
     *     completed_lesson_ids: array<int, int>,
     *     current_lesson: Lesson|null,
     *     next_lesson: Lesson|null,
     *     previous_lesson: Lesson|null,
     *     total_watched_seconds: int
     * }
     */
    public function execute(User $student, Course $course, ?string $lessonSlug = null): array
    {
        $enrollment = $this->enrollments->findFor($student, $course);

        if ($enrollment === null) {
            throw BusinessRuleViolation::forbidden(
                'Enrol in this course to start learning.',
                'not_enrolled',
            );
        }

        if (! $enrollment->grantsAccess()) {
            throw BusinessRuleViolation::forbidden(
                'Your enrolment is no longer active.',
                'enrollment_inactive',
                ['status' => $enrollment->status->value],
            );
        }

        $fullCourse = $this->courses->findWithCurriculum($course->id) ?? $course;

        $current = $this->resolveCurrentLesson($fullCourse, $enrollment, $lessonSlug);

        return [
            'course' => $fullCourse,
            'enrollment' => $enrollment,
            'completed_lesson_ids' => $this->progress->completedLessonIds($enrollment),
            'current_lesson' => $current,
            'next_lesson' => $current !== null ? $this->lessons->next($current) : null,
            'previous_lesson' => $current !== null ? $this->lessons->previous($current) : null,
            'total_watched_seconds' => $this->progress->totalWatchedSeconds($enrollment),
        ];
    }

    /**
     * Falls back through: requested lesson -> last visited -> first lesson.
     */
    private function resolveCurrentLesson(Course $course, Enrollment $enrollment, ?string $lessonSlug): ?Lesson
    {
        if ($lessonSlug !== null) {
            $lesson = $course->lessons()->where('slug', $lessonSlug)->first();

            if ($lesson === null) {
                throw BusinessRuleViolation::notFound('That lesson does not exist.', 'lesson_not_found');
            }

            return $lesson;
        }

        if ($enrollment->last_lesson_id !== null) {
            $lesson = $this->lessons->find($enrollment->last_lesson_id);

            if ($lesson !== null) {
                return $lesson;
            }
        }

        return $this->lessons->forCourse($course)->first();
    }
}
