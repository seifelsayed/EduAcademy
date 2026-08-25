<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Criteria\CourseCriteria;
use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final readonly class ListCourses
{
    public function __construct(
        private CourseRepositoryInterface $courses,
    ) {}

    /**
     * Public catalogue browsing — only ever returns published courses.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, \App\Infrastructure\Persistence\Eloquent\Models\Course>
     */
    public function execute(array $filters): LengthAwarePaginator
    {
        return $this->courses->matching(
            $this->buildCriteria($filters)->withStatus(CourseStatus::Published)
        );
    }

    /**
     * Instructor-facing listing — includes drafts owned by that instructor.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, \App\Infrastructure\Persistence\Eloquent\Models\Course>
     */
    public function forInstructor(int $instructorId, array $filters): LengthAwarePaginator
    {
        $criteria = $this->buildCriteria($filters)->withInstructor($instructorId);

        $status = CourseStatus::tryFrom((string) ($filters['status'] ?? ''));

        if ($status !== null) {
            $criteria = $criteria->withStatus($status);
        }

        return $this->courses->matching($criteria);
    }

    /**
     * Admin listing — every course, any status.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, \App\Infrastructure\Persistence\Eloquent\Models\Course>
     */
    public function forAdmin(array $filters): LengthAwarePaginator
    {
        $criteria = $this->buildCriteria($filters);

        $status = CourseStatus::tryFrom((string) ($filters['status'] ?? ''));

        if ($status !== null) {
            $criteria = $criteria->withStatus($status);
        }

        return $this->courses->matching($criteria);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function buildCriteria(array $filters): CourseCriteria
    {
        $categoryIds = $filters['category_ids'] ?? null;

        if ($categoryIds === null && isset($filters['category_id'])) {
            $categoryIds = [$filters['category_id']];
        }

        $sort = (string) ($filters['sort'] ?? 'newest');

        return new CourseCriteria(
            search: isset($filters['search']) ? (string) $filters['search'] : null,
            categoryIds: array_map('intval', (array) ($categoryIds ?? [])),
            level: CourseLevel::tryFrom((string) ($filters['level'] ?? '')),
            freeOnly: isset($filters['free']) ? (bool) $filters['free'] : null,
            minRating: isset($filters['min_rating']) ? (float) $filters['min_rating'] : null,
            sort: in_array($sort, CourseCriteria::sortOptions(), true) ? $sort : 'newest',
            page: max(1, (int) ($filters['page'] ?? 1)),
            perPage: (int) ($filters['per_page'] ?? config('platform.pagination.per_page', 15)),
        );
    }
}
