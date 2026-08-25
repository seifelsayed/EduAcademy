<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Lesson
 */
final class LessonResource extends JsonResource
{
    /**
     * Locked lessons still appear in the curriculum (so learners can see what
     * they get) but their body and media are withheld.
     */
    public function toArray(Request $request): array
    {
        $unlocked = $this->resolveAccess($request);

        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'section_id' => $this->section_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type?->value ?? 'video',
            'duration_minutes' => (int) ($this->duration_minutes ?? 0),
            'position' => (int) ($this->position ?? 1),
            'is_preview' => (bool) ($this->is_preview ?? false),
            'is_published' => (bool) ($this->is_published ?? true),
            'is_locked' => ! $unlocked,

            'content' => $this->when($unlocked, $this->content),
            'video_url' => $this->when($unlocked, $this->video_url),
            'video_provider' => $this->when($unlocked, $this->video_provider),
            'video_duration_seconds' => $this->video_duration_seconds,
            'attachments' => $this->when($unlocked, $this->attachments ?? []),

            'has_quiz' => $this->when($this->relationLoaded('quiz'), $this->quiz !== null),
            'has_assignment' => $this->when($this->relationLoaded('assignment'), $this->assignment !== null),
            'quiz' => $this->whenLoaded('quiz', fn () => $this->quiz ? new QuizResource($this->quiz) : null),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment ? new AssignmentResource($this->assignment) : null),

            // Injected by the player controller from the learner's progress rows.
            'is_completed' => $this->when(isset($this->is_completed), fn () => (bool) $this->is_completed),
            'last_position_seconds' => $this->when(
                isset($this->last_position_seconds),
                fn () => (int) $this->last_position_seconds
            ),
        ];
    }

    /**
     * A lesson is unlocked when it is a free preview, or when the controller
     * has flagged the viewer as having access.
     */
    private function resolveAccess(Request $request): bool
    {
        if (isset($this->has_access)) {
            return (bool) $this->has_access;
        }

        if ($this->isFreelyViewable()) {
            return true;
        }

        $user = $request->user();

        return $user !== null && ($user->isAdmin() || ($this->course !== null && $this->course->isOwnedBy($user)));
    }
}
