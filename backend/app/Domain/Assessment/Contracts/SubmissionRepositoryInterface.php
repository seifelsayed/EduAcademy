<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Contracts;

use App\Domain\Assessment\Enums\SubmissionStatus;
use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends Repository<Submission>
 */
interface SubmissionRepositoryInterface extends Repository
{
    public function findFor(Assignment $assignment, User $student): ?Submission;

    /**
     * @return LengthAwarePaginator<int, Submission>
     */
    public function paginateForAssignment(Assignment $assignment, ?SubmissionStatus $status, int $perPage): LengthAwarePaginator;

    /**
     * Submissions awaiting grading across every course an instructor owns.
     *
     * @return LengthAwarePaginator<int, Submission>
     */
    public function paginatePendingForInstructor(User $instructor, int $perPage): LengthAwarePaginator;

    public function countPendingForInstructor(User $instructor): int;
}
