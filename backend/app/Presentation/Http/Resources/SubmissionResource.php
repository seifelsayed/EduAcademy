<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Submission
 */
final class SubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'content' => $this->content,
            'attachments' => $this->attachments ?? [],
            'status' => $this->status?->value ?? (is_string($this->status) ? $this->status : 'submitted'),
            'score' => $this->score,

            'feedback' => $this->feedback,
            'is_late' => $this->is_late,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'graded_at' => $this->graded_at?->toIso8601String(),

            'student' => $this->whenLoaded('user', fn () => $this->user ? new UserResource($this->user) : null),
            'grader' => $this->whenLoaded('grader', fn () => $this->grader ? new UserResource($this->grader) : null),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment ? new AssignmentResource($this->assignment) : null),
        ];
    }
}
