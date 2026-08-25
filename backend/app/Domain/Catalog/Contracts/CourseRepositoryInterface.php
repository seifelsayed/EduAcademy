<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Contracts;

use App\Domain\Catalog\Criteria\CourseCriteria;
use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Course>
 */
interface CourseRepositoryInterface extends Repository
{
    /**
     * @return LengthAwarePaginator<int, Course>
     */
    public function matching(CourseCriteria $criteria): LengthAwarePaginator;

    public function findBySlug(string $slug): ?Course;

    public function findPublishedBySlug(string $slug): ?Course;

    /**
     * Course with its full curriculum eager-loaded (sections, lessons, quizzes).
     */
    public function findWithCurriculum(int $id): ?Course;

    public function slugExists(string $slug, ?int $exceptId = null): bool;

    /**
     * @return Collection<int, Course>
     */
    public function featured(int $limit): Collection;

    /**
     * Published courses in the same categories, excluding the given course.
     *
     * @return Collection<int, Course>
     */
    public function related(Course $course, int $limit): Collection;

    /**
     * Recomputes denormalised counters (lessons, duration, students, rating).
     */
    public function refreshAggregates(Course $course): Course;

    /**
     * @return array{total: int, published: int, draft: int, pending_review: int}
     */
    public function statistics(?int $instructorId = null): array;
}
