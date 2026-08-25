<?php

declare(strict_types=1);

namespace App\Presentation\Policies;

use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final class SubmissionPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    /**
     * The author and the course instructor can both read a submission.
     */
    public function view(User $user, Submission $submission): bool
    {
        return $submission->user_id === $user->id || $this->isCourseInstructor($user, $submission);
    }

    public function update(User $user, Submission $submission): bool
    {
        return $submission->user_id === $user->id && $submission->status->isEditableByStudent();
    }

    public function grade(User $user, Submission $submission): bool
    {
        return $this->isCourseInstructor($user, $submission);
    }

    private function isCourseInstructor(User $user, Submission $submission): bool
    {
        return $user->canTeach()
            && $submission->assignment->lesson->course->isOwnedBy($user);
    }
}
