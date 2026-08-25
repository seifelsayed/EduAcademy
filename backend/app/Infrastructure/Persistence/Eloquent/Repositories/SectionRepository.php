<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Catalog\Contracts\SectionRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Section>
 */
final class SectionRepository extends BaseRepository implements SectionRepositoryInterface
{
    protected function model(): string
    {
        return Section::class;
    }

    public function forCourse(Course $course): Collection
    {
        return $this->query()
            ->where('course_id', $course->id)
            ->with(['lessons' => fn ($q) => $q->orderBy('position')])
            ->orderBy('position')
            ->get();
    }

    public function nextPosition(Course $course): int
    {
        return (int) $this->query()->where('course_id', $course->id)->max('position') + 1;
    }

    public function reorder(Course $course, array $orderedIds): void
    {
        DB::transaction(function () use ($course, $orderedIds): void {
            foreach (array_values($orderedIds) as $index => $sectionId) {
                $this->query()
                    ->where('course_id', $course->id)
                    ->whereKey($sectionId)
                    ->update(['position' => $index + 1]);
            }
        });
    }
}
