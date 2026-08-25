<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Review
 */
final class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'instructor_reply' => $this->instructor_reply,
            'replied_at' => $this->replied_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'is_mine' => $request->user()?->id === $this->user_id,

            'author' => $this->whenLoaded('user', fn () => $this->user ? new UserResource($this->user) : null),
            'course' => $this->whenLoaded('course', fn () => $this->course ? new CourseResource($this->course) : null),
        ];
    }
}
