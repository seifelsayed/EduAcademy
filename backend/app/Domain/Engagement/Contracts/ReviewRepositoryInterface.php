<?php

declare(strict_types=1);

namespace App\Domain\Engagement\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends Repository<Review>
 */
interface ReviewRepositoryInterface extends Repository
{
    public function findFor(Course $course, User $student): ?Review;

    /**
     * @return LengthAwarePaginator<int, Review>
     */
    public function paginateForCourse(Course $course, ?int $rating, int $perPage): LengthAwarePaginator;

    public function averageRating(Course $course): float;

    public function countForCourse(Course $course): int;

    /**
     * Number of reviews per star value, keyed 1..5.
     *
     * @return array<int, int>
     */
    public function ratingBreakdown(Course $course): array;

    /**
     * Average rating across every course owned by an instructor.
     */
    public function averageRatingForInstructor(User $instructor): float;
}
