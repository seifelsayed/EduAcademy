<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Enrollment
 */
final class EnrollmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status?->value ?? (is_string($this->status) ? $this->status : 'active'),
            'progress_percent' => round($this->progress_percent, 2),

            'completed_lessons_count' => $this->completed_lessons_count,
            'enrolled_at' => $this->enrolled_at?->toIso8601String(),
            'last_accessed_at' => $this->last_accessed_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'is_expired' => $this->isExpired(),

            'course' => $this->whenLoaded('course', fn () => $this->course ? new CourseResource($this->course) : null),
            'student' => $this->whenLoaded('user', fn () => $this->user ? new UserResource($this->user) : null),
            'last_lesson' => $this->whenLoaded('lastLesson', fn () => $this->lastLesson ? new LessonResource($this->lastLesson) : null),
            'certificate' => $this->whenLoaded('certificate', fn () => $this->certificate ? new CertificateResource($this->certificate) : null),
        ];
    }
}
