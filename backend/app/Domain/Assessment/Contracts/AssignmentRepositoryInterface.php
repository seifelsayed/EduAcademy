<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Assignment>
 */
interface AssignmentRepositoryInterface extends Repository
{
    public function findForLesson(Lesson $lesson): ?Assignment;

    /**
     * @return Collection<int, Assignment>
     */
    public function forCourse(Course $course): Collection;
}
