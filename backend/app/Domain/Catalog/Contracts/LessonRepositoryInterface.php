<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Lesson>
 */
interface LessonRepositoryInterface extends Repository
{
    /**
     * @return Collection<int, Lesson>
     */
    public function forSection(Section $section): Collection;

    /**
     * Every lesson of a course, ordered by section then position.
     *
     * @return Collection<int, Lesson>
     */
    public function forCourse(Course $course): Collection;

    /**
     * @return array<int, int>
     */
    public function idsForCourse(Course $course): array;

    public function countForCourse(Course $course): int;

    public function totalDurationMinutes(Course $course): int;

    public function nextPosition(Section $section): int;

    /**
     * @param  array<int, int>  $orderedIds  Lesson ids in their new order.
     */
    public function reorder(Section $section, array $orderedIds): void;

    /**
     * The lesson that follows the given one within the course, if any.
     */
    public function next(Lesson $lesson): ?Lesson;

    public function previous(Lesson $lesson): ?Lesson;
}
