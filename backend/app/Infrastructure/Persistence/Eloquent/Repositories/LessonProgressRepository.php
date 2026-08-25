<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Learning\Contracts\LessonProgressRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\LessonProgress;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<LessonProgress>
 */
final class LessonProgressRepository extends BaseRepository implements LessonProgressRepositoryInterface
{
    protected function model(): string
    {
        return LessonProgress::class;
    }

    public function findFor(Enrollment $enrollment, Lesson $lesson): ?LessonProgress
    {
        return $this->query()
            ->where('enrollment_id', $enrollment->id)
            ->where('lesson_id', $lesson->id)
            ->first();
    }

    public function upsertFor(Enrollment $enrollment, Lesson $lesson, array $attributes): LessonProgress
    {
        $progress = $this->query()->firstOrNew([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);

        $progress->fill($attributes)->save();

        return $progress->refresh();
    }

    public function forEnrollment(Enrollment $enrollment): Collection
    {
        return $this->query()
            ->where('enrollment_id', $enrollment->id)
            ->get();
    }

    public function countCompleted(Enrollment $enrollment): int
    {
        return $this->query()
            ->where('enrollment_id', $enrollment->id)
            ->where('is_completed', true)
            ->count();
    }

    public function completedLessonIds(Enrollment $enrollment): array
    {
        return $this->query()
            ->where('enrollment_id', $enrollment->id)
            ->where('is_completed', true)
            ->pluck('lesson_id')
            ->map(static fn ($id): int => (int) $id)
            ->all();
    }

    public function totalWatchedSeconds(Enrollment $enrollment): int
    {
        return (int) $this->query()
            ->where('enrollment_id', $enrollment->id)
            ->sum('watched_seconds');
    }
}
