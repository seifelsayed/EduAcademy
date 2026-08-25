<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Lesson>
 */
final class LessonRepository extends BaseRepository implements LessonRepositoryInterface
{
    protected function model(): string
    {
        return Lesson::class;
    }

    public function forSection(Section $section): Collection
    {
        return $this->query()
            ->where('section_id', $section->id)
            ->orderBy('position')
            ->get();
    }

    public function forCourse(Course $course): Collection
    {
        return $this->orderedForCourse($course)->get();
    }

    public function idsForCourse(Course $course): array
    {
        return $this->orderedForCourse($course)
            ->pluck('id')
            ->map(static fn ($id): int => (int) $id)
            ->all();
    }

    public function countForCourse(Course $course): int
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->count();
    }

    public function totalDurationMinutes(Course $course): int
    {
        return (int) $this->query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->sum('duration_minutes');
    }

    public function nextPosition(Section $section): int
    {
        return (int) $this->query()->where('section_id', $section->id)->max('position') + 1;
    }

    public function reorder(Section $section, array $orderedIds): void
    {
        DB::transaction(function () use ($section, $orderedIds): void {
            foreach (array_values($orderedIds) as $index => $lessonId) {
                $this->query()
                    ->where('section_id', $section->id)
                    ->whereKey($lessonId)
                    ->update(['position' => $index + 1]);
            }
        });
    }

    public function next(Lesson $lesson): ?Lesson
    {
        return $this->neighbour($lesson, forward: true);
    }

    public function previous(Lesson $lesson): ?Lesson
    {
        return $this->neighbour($lesson, forward: false);
    }

    /**
     * Walks the flattened curriculum (section order, then lesson order) to find
     * the lesson immediately before or after the given one.
     */
    private function neighbour(Lesson $lesson, bool $forward): ?Lesson
    {
        $ids = $this->idsForCourse($lesson->course);
        $index = array_search($lesson->id, $ids, true);

        if ($index === false) {
            return null;
        }

        $targetIndex = $forward ? $index + 1 : $index - 1;

        if (! isset($ids[$targetIndex])) {
            return null;
        }

        return $this->find($ids[$targetIndex]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<Lesson>
     */
    private function orderedForCourse(Course $course): \Illuminate\Database\Eloquent\Builder
    {
        return $this->query()
            ->join('sections', 'sections.id', '=', 'lessons.section_id')
            ->where('lessons.course_id', $course->id)
            ->where('lessons.is_published', true)
            ->orderBy('sections.position')
            ->orderBy('lessons.position')
            ->select('lessons.*');
    }
}
