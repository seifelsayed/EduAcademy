<?php

declare(strict_types=1);

namespace App\Application\Engagement\UseCases;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use App\Infrastructure\Persistence\Eloquent\Models\Wishlist;
use Illuminate\Database\Eloquent\Collection;

final readonly class ToggleWishlist
{
    /**
     * @return array{wishlisted: bool}
     */
    public function execute(User $student, Course $course): array
    {
        $existing = Wishlist::query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing !== null) {
            $existing->delete();

            return ['wishlisted' => false];
        }

        Wishlist::query()->create([
            'user_id' => $student->id,
            'course_id' => $course->id,
        ]);

        return ['wishlisted' => true];
    }

    /**
     * @return Collection<int, Wishlist>
     */
    public function list(User $student): Collection
    {
        return Wishlist::query()
            ->where('user_id', $student->id)
            ->with(['course.instructor:id,name,avatar_path,role', 'course.category:id,name,slug,icon,position,is_active'])
            ->latest()
            ->get();
    }

    /**
     * @param  array<int, int>  $courseIds
     * @return array<int, int>  Ids of the courses that are wishlisted.
     */
    public function filterWishlisted(User $student, array $courseIds): array
    {
        if ($courseIds === []) {
            return [];
        }

        return Wishlist::query()
            ->where('user_id', $student->id)
            ->whereIn('course_id', $courseIds)
            ->pluck('course_id')
            ->map(static fn ($id): int => (int) $id)
            ->all();
    }
}
