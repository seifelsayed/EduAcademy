<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;

final readonly class DeleteCourse
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
    ) {}

    public function execute(Course $course, bool $force = false): void
    {
        $students = $this->enrollments->countForCourse($course);

        // Deleting a course out from under paying learners would destroy their
        // progress, so it is archived instead unless an admin forces it.
        if ($students > 0 && ! $force) {
            throw BusinessRuleViolation::conflict(
                'This course has enrolled students and cannot be deleted. Archive it instead.',
                'course_has_students',
                ['students_count' => $students],
            );
        }

        $this->courses->delete($course);
    }
}
