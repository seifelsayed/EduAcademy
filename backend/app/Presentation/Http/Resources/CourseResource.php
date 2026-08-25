<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Catalogue card shape — enough for a grid, without the curriculum.
 *
 * @mixin Course
 */
class CourseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $effective = $this->effectivePriceCents();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'outcomes' => $this->outcomes ?? [],
            'requirements' => $this->requirements ?? [],
            'thumbnail_url' => $this->thumbnailUrl(),
            'level' => $this->level?->value ?? (is_string($this->level) ? $this->level : 'all_levels'),
            'level_label' => is_object($this->level) && method_exists($this->level, 'label') ? $this->level->label() : ($this->level?->value ?? 'All Levels'),
            'language' => $this->language ?? 'English',
            'status' => $this->status?->value ?? (is_string($this->status) ? $this->status : 'draft'),

            'price' => [
                'amount_cents' => $this->price_cents ?? 0,
                'discount_cents' => $this->discount_price_cents,
                'effective_cents' => $effective,
                'currency' => $this->currency ?? 'USD',
                'is_free' => $effective === 0,
                'discount_percent' => $this->discountPercent(),
            ],


            'duration_minutes' => (int) ($this->duration_minutes ?? 0),
            'lessons_count' => (int) ($this->lessons_count ?? 0),
            'sections_count' => (int) ($this->sections_count ?? 0),
            'students_count' => (int) ($this->students_count ?? 0),
            'rating' => [
                'average' => round((float) ($this->rating_avg ?? 0), 2),
                'count' => (int) ($this->rating_count ?? 0),
            ],
            'is_featured' => (bool) ($this->is_featured ?? false),
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),


            'instructor' => $this->whenLoaded('instructor', fn () => $this->instructor ? new UserResource($this->instructor) : null),
            'category' => $this->whenLoaded('category', fn () => $this->category ? new CategoryResource($this->category) : null),

            // Set by controllers that know the viewer's relationship to the course.
            'is_enrolled' => $this->when(isset($this->is_enrolled), fn () => (bool) $this->is_enrolled),
            'is_wishlisted' => $this->when(isset($this->is_wishlisted), fn () => (bool) $this->is_wishlisted),
        ];
    }

    protected function discountPercent(): int
    {
        if ($this->discount_price_cents === null || $this->price_cents === 0) {
            return 0;
        }

        if ($this->discount_price_cents >= $this->price_cents) {
            return 0;
        }

        return (int) round((($this->price_cents - $this->discount_price_cents) / $this->price_cents) * 100);
    }
}
