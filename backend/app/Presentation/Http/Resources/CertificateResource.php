<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Certificate
 */
final class CertificateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'serial' => $this->serial,
            'recipient_name' => $this->recipient_name,
            'course_title' => $this->course_title,
            'instructor_name' => $this->instructor_name,
            'final_score' => round($this->final_score, 2),
            'issued_at' => $this->issued_at?->toIso8601String(),
            'verify_url' => rtrim((string) config('app.frontend_url'), '/').'/certificates/'.$this->serial,

            'course' => $this->whenLoaded('course', fn () => $this->course ? new CourseResource($this->course) : null),
        ];
    }
}
