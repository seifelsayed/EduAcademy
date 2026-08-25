<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Assessment\Contracts\AssignmentRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Assignment>
 */
final class AssignmentRepository extends BaseRepository implements AssignmentRepositoryInterface
{
    protected function model(): string
    {
        return Assignment::class;
    }

    public function findForLesson(Lesson $lesson): ?Assignment
    {
        return $this->query()->where('lesson_id', $lesson->id)->first();
    }

    public function forCourse(Course $course): Collection
    {
        return $this->query()
            ->whereHas('lesson', fn ($q) => $q->where('course_id', $course->id))
            ->with('lesson:id,title,slug,section_id')
            ->withCount('submissions')
            ->get();
    }
}
