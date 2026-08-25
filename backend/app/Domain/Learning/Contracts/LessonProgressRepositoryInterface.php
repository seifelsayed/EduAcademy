<?php

declare(strict_types=1);

namespace App\Domain\Learning\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\LessonProgress;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<LessonProgress>
 */
interface LessonProgressRepositoryInterface extends Repository
{
    public function findFor(Enrollment $enrollment, Lesson $lesson): ?LessonProgress;

    /**
     * Creates the row when absent, then applies the given attributes.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function upsertFor(Enrollment $enrollment, Lesson $lesson, array $attributes): LessonProgress;

    /**
     * @return Collection<int, LessonProgress>
     */
    public function forEnrollment(Enrollment $enrollment): Collection;

    public function countCompleted(Enrollment $enrollment): int;

    /**
     * Ids of the lessons this enrolment has completed.
     *
     * @return array<int, int>
     */
    public function completedLessonIds(Enrollment $enrollment): array;

    /**
     * Sum of watched seconds across the enrolment, for "time spent" stats.
     */
    public function totalWatchedSeconds(Enrollment $enrollment): int;
}
