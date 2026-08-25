<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Assignment
 */
final class AssignmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'title' => $this->title,
            'instructions' => $this->instructions,
            'attachments' => $this->attachments ?? [],
            'max_points' => $this->max_points,
            'due_at' => $this->due_at?->toIso8601String(),
            'allow_late_submissions' => $this->allow_late_submissions,
            'is_overdue' => $this->isOverdue(),
            'accepts_submissions' => $this->acceptsSubmissions(),
            'submissions_count' => $this->whenCounted('submissions'),

            // The requesting learner's own submission, when the controller loads it.
            'my_submission' => $this->whenLoaded('mySubmission', fn () => $this->mySubmission ? new SubmissionResource($this->mySubmission) : null),
        ];
    }
}
