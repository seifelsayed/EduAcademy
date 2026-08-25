<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Section
 */
final class SectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'title' => $this->title,
            'description' => $this->description,
            'position' => $this->position,
            'lessons_count' => $this->whenLoaded('lessons', fn () => $this->lessons->count()),
            'duration_minutes' => $this->whenLoaded('lessons', fn () => (int) $this->lessons->sum('duration_minutes')),
            'lessons' => LessonResource::collection($this->whenLoaded('lessons')),
        ];
    }
}
