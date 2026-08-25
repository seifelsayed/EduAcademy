<?php

declare(strict_types=1);

namespace App\Presentation\Policies;

use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final class ReviewPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        return $user->isAdmin() ? true : null;
    }

    public function update(User $user, Review $review): bool
    {
        return $review->user_id === $user->id;
    }

    public function delete(User $user, Review $review): bool
    {
        return $review->user_id === $user->id;
    }

    public function reply(User $user, Review $review): bool
    {
        return $user->canTeach() && $review->course->isOwnedBy($user);
    }
}
