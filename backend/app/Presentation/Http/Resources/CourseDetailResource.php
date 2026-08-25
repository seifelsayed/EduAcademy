<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Http\Request;

/**
 * Full course page shape: everything from the card plus prose and curriculum.
 *
 * @mixin Course
 */
final class CourseDetailResource extends CourseResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'description' => $this->description,
            'promo_video_url' => $this->promo_video_url,
            'requirements' => $this->requirements ?? [],
            'outcomes' => $this->outcomes ?? [],
            'target_audience' => $this->target_audience ?? [],
            'sections' => SectionResource::collection($this->whenLoaded('sections')),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
