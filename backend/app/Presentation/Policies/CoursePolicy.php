<?php

declare(strict_types=1);

namespace App\Presentation\Policies;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;

/**
 * The `?User` type hints matter: the course detail endpoint is public, so the
 * policy has to be able to answer for a guest instead of denying outright.
 */
final class CoursePolicy
{
    /**
     * Admins bypass every course check.
     */
    public function before(?User $user, string $ability): ?bool
    {
        return $user?->isAdmin() === true ? true : null;
    }

    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Published courses are public; drafts are visible to their author, instructors, and admins.
     */
    public function view(?User $user, Course $course): bool
    {
        if ($course->isPublished()) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        return $course->isOwnedBy($user) || $user->canTeach();
    }


    public function create(User $user): bool
    {
        return $user->canTeach();
    }

    public function update(User $user, Course $course): bool
    {
        return $user->canTeach() && $course->isOwnedBy($user);
    }

    public function delete(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    public function publish(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    /**
     * Managing sections, lessons, quizzes and assignments.
     */
    public function manageCurriculum(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    /**
     * Viewing the roster and grading submissions.
     */
    public function manageStudents(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    public function enroll(User $user, Course $course): bool
    {
        return $course->status->allowsEnrollment() && ! $course->isOwnedBy($user);
    }
}
