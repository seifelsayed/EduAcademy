<?php

declare(strict_types=1);

namespace App\Presentation\Policies;

use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final class LessonPolicy
{
    public function __construct(
        private readonly EnrollmentRepositoryInterface $enrollments,
    ) {}

    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    /**
     * Watchable when the lesson is a free preview, the viewer owns the course,
     * or the viewer holds an active enrolment.
     */
    public function view(User $user, Lesson $lesson): bool
    {
        if ($lesson->isFreelyViewable()) {
            return true;
        }

        if ($lesson->course->isOwnedBy($user)) {
            return true;
        }

        return $this->enrollments->findFor($user, $lesson->course)?->grantsAccess() === true;
    }

    public function update(User $user, Lesson $lesson): bool
    {
        return $user->canTeach() && $lesson->course->isOwnedBy($user);
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $this->update($user, $lesson);
    }
}
