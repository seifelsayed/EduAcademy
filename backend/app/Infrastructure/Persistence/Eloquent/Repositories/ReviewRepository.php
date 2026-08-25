<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Review>
 */
final class ReviewRepository extends BaseRepository implements ReviewRepositoryInterface
{
    protected function model(): string
    {
        return Review::class;
    }

    public function findFor(Course $course, User $student): ?Review
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->where('user_id', $student->id)
            ->first();
    }

    public function paginateForCourse(Course $course, ?int $rating, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->approved()
            ->when($rating !== null, fn ($q) => $q->where('rating', $rating))
            ->with(['user:id,name,avatar_path'])
            ->latest()
            ->paginate($this->normalisePerPage($perPage));
    }

    public function averageRating(Course $course): float
    {
        return round((float) $this->query()
            ->where('course_id', $course->id)
            ->approved()
            ->avg('rating'), 2);
    }

    public function countForCourse(Course $course): int
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->approved()
            ->count();
    }

    public function ratingBreakdown(Course $course): array
    {
        $counts = $this->query()
            ->where('course_id', $course->id)
            ->approved()
            ->select('rating', DB::raw('COUNT(*) as total'))
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $breakdown = [];
        for ($star = 5; $star >= 1; $star--) {
            $breakdown[$star] = (int) ($counts[$star] ?? 0);
        }

        return $breakdown;
    }

    public function averageRatingForInstructor(User $instructor): float
    {
        return round((float) $this->query()
            ->approved()
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $instructor->id))
            ->avg('rating'), 2);
    }
}
