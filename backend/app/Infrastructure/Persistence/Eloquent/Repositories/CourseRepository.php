<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Criteria\CourseCriteria;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Course>
 */
final class CourseRepository extends BaseRepository implements CourseRepositoryInterface
{
    protected function model(): string
    {
        return Course::class;
    }

    public function matching(CourseCriteria $criteria): LengthAwarePaginator
    {
        $query = $this->query()->with(['instructor:id,name,avatar_path,headline,role', 'category:id,name,slug,icon,position,is_active']);

        $this->applyFilters($query, $criteria);
        $this->applySort($query, $criteria->sort);

        return $query->paginate(
            perPage: $this->normalisePerPage($criteria->perPage),
            page: max(1, $criteria->page),
        );
    }

    public function findBySlug(string $slug): ?Course
    {
        return $this->query()
            ->with(['instructor', 'category'])
            ->where('slug', $slug)
            ->first();
    }

    public function findPublishedBySlug(string $slug): ?Course
    {
        return $this->query()
            ->published()
            ->with(['instructor', 'category'])
            ->where('slug', $slug)
            ->first();
    }

    public function findWithCurriculum(int $id): ?Course
    {
        return $this->query()
            ->with([
                'instructor',
                'category',
                'sections' => fn ($q) => $q->orderBy('position'),
                'sections.lessons' => fn ($q) => $q->orderBy('position'),
                'sections.lessons.quiz',
                'sections.lessons.assignment',
            ])
            ->find($id);
    }

    public function slugExists(string $slug, ?int $exceptId = null): bool
    {
        return $this->query()
            ->withTrashed()
            ->where('slug', $slug)
            ->when($exceptId !== null, fn ($q) => $q->whereKeyNot($exceptId))
            ->exists();
    }

    public function featured(int $limit): Collection
    {
        return $this->query()
            ->published()
            ->with(['instructor:id,name,avatar_path,role', 'category:id,name,slug,icon,position,is_active'])
            ->orderByDesc('is_featured')
            ->orderByDesc('students_count')
            ->orderByDesc('rating_avg')
            ->limit($limit)
            ->get();
    }

    public function related(Course $course, int $limit): Collection
    {
        return $this->query()
            ->published()
            ->whereKeyNot($course->id)
            ->when($course->category_id !== null, fn ($q) => $q->where('category_id', $course->category_id))
            ->with(['instructor:id,name,avatar_path,role'])
            ->orderByDesc('rating_avg')
            ->limit($limit)
            ->get();
    }

    public function refreshAggregates(Course $course): Course
    {
        $lessons = $course->lessons()->where('is_published', true);

        $course->forceFill([
            'lessons_count' => (clone $lessons)->count(),
            'duration_minutes' => (int) (clone $lessons)->sum('duration_minutes'),
            'sections_count' => $course->sections()->count(),
            'students_count' => $course->enrollments()->count(),
            'rating_count' => $course->reviews()->approved()->count(),
            'rating_avg' => round((float) $course->reviews()->approved()->avg('rating'), 2),
        ])->save();

        return $course->refresh();
    }

    public function statistics(?int $instructorId = null): array
    {
        $base = fn (): Builder => $this->query()
            ->when($instructorId !== null, fn ($q) => $q->where('instructor_id', $instructorId));

        return [
            'total' => $base()->count(),
            'published' => $base()->where('status', CourseStatus::Published->value)->count(),
            'draft' => $base()->where('status', CourseStatus::Draft->value)->count(),
            'pending_review' => $base()->where('status', CourseStatus::PendingReview->value)->count(),
        ];
    }

    /**
     * @param  Builder<Course>  $query
     */
    private function applyFilters(Builder $query, CourseCriteria $criteria): void
    {
        if ($criteria->status !== null) {
            $query->where('status', $criteria->status->value);
        }

        if ($criteria->instructorId !== null) {
            $query->where('instructor_id', $criteria->instructorId);
        }

        if ($criteria->search !== null && trim($criteria->search) !== '') {
            $term = trim($criteria->search);
            $query->where(function (Builder $q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('subtitle', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhereHas('instructor', fn (Builder $iq) => $iq->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('category', fn (Builder $cq) => $cq->where('name', 'like', "%{$term}%"));
            });
        }

        if ($criteria->categoryIds !== []) {
            $query->whereIn('category_id', $criteria->categoryIds);
        }

        if ($criteria->level !== null) {
            $query->where('level', $criteria->level->value);
        }

        if ($criteria->freeOnly === true) {
            $query->where(function (Builder $q) {
                $q->where('price_cents', 0)
                    ->orWhere('discount_price_cents', 0);
            });
        }

        if ($criteria->minRating !== null) {
            $query->where('rating_avg', '>=', $criteria->minRating);
        }
    }

    /**
     * @param  Builder<Course>  $query
     */
    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'oldest' => $query->oldest('published_at'),
            'popular' => $query->orderByDesc('students_count'),
            'rating' => $query->orderByDesc('rating_avg')->orderByDesc('rating_count'),
            'price_asc' => $query->orderByRaw('COALESCE(discount_price_cents, price_cents) asc'),
            'price_desc' => $query->orderByRaw('COALESCE(discount_price_cents, price_cents) desc'),
            'title' => $query->orderBy('title'),
            default => $query->latest('published_at')->latest('id'),
        };
    }
}
