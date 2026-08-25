<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Assessment\Enums\SubmissionStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * @extends BaseRepository<Submission>
 */
final class SubmissionRepository extends BaseRepository implements SubmissionRepositoryInterface
{
    protected function model(): string
    {
        return Submission::class;
    }

    public function findFor(Assignment $assignment, User $student): ?Submission
    {
        return $this->query()
            ->where('assignment_id', $assignment->id)
            ->where('user_id', $student->id)
            ->first();
    }

    public function paginateForAssignment(Assignment $assignment, ?SubmissionStatus $status, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('assignment_id', $assignment->id)
            ->when($status !== null, fn ($q) => $q->where('status', $status->value))
            ->with(['user:id,name,email,avatar_path'])
            ->orderByDesc('submitted_at')
            ->paginate($this->normalisePerPage($perPage));
    }

    public function paginatePendingForInstructor(User $instructor, int $perPage): LengthAwarePaginator
    {
        return $this->pendingForInstructor($instructor)
            ->with([
                'user:id,name,avatar_path',
                'assignment:id,title,lesson_id,max_points',
                'assignment.lesson:id,title,course_id',
                'assignment.lesson.course:id,title,slug',
            ])
            ->orderBy('submitted_at')
            ->paginate($this->normalisePerPage($perPage));
    }

    public function countPendingForInstructor(User $instructor): int
    {
        return $this->pendingForInstructor($instructor)->count();
    }

    /**
     * @return Builder<Submission>
     */
    private function pendingForInstructor(User $instructor): Builder
    {
        return $this->query()
            ->where('status', SubmissionStatus::Submitted->value)
            ->whereHas(
                'assignment.lesson.course',
                fn ($q) => $q->where('instructor_id', $instructor->id)
            );
    }
}
