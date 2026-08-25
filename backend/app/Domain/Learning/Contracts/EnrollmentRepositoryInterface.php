<?php

declare(strict_types=1);

namespace App\Domain\Learning\Contracts;

use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Enrollment>
 */
interface EnrollmentRepositoryInterface extends Repository
{
    public function findFor(User $student, Course $course): ?Enrollment;

    public function exists(User $student, Course $course): bool;

    /**
     * @return LengthAwarePaginator<int, Enrollment>
     */
    public function paginateForStudent(User $student, ?EnrollmentStatus $status, int $perPage): LengthAwarePaginator;

    /**
     * @return LengthAwarePaginator<int, Enrollment>
     */
    public function paginateForCourse(Course $course, int $perPage): LengthAwarePaginator;

    public function countForCourse(Course $course): int;

    /**
     * Total students across every course owned by an instructor.
     */
    public function countForInstructor(User $instructor): int;

    /**
     * Most recently active enrolments, for the "continue learning" rail.
     *
     * @return Collection<int, Enrollment>
     */
    public function recentlyActive(User $student, int $limit): Collection;

    /**
     * Enrolment counts per day for the last N days, keyed by Y-m-d.
     *
     * @return array<string, int>
     */
    public function dailyCounts(int $days, ?int $instructorId = null): array;
}
