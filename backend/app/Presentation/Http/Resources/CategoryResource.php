<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
final class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'color' => $this->color,
            'position' => (int) ($this->position ?? 0),
            'is_active' => (bool) ($this->is_active ?? true),
            'courses_count' => $this->whenCounted('courses'),
            'children' => self::collection($this->whenLoaded('children')),
        ];
    }
}
