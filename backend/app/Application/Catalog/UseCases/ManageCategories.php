<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Application\Shared\Services\SlugGenerator;
use App\Domain\Catalog\Contracts\CategoryRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Database\Eloquent\Collection;

final readonly class ManageCategories
{
    public function __construct(
        private CategoryRepositoryInterface $categories,
        private SlugGenerator $slugs,
    ) {}

    /**
     * @return Collection<int, Category>
     */
    public function tree(): Collection
    {
        return $this->categories->tree();
    }

    /**
     * @return Collection<int, Category>
     */
    public function withCounts(): Collection
    {
        return $this->categories->withPublishedCourseCounts();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Category
    {
        return $this->categories->create([
            'parent_id' => $data['parent_id'] ?? null,
            'name' => $data['name'],
            'slug' => $this->slugs->unique(
                (string) $data['name'],
                fn (string $slug): bool => $this->categories->slugExists($slug),
            ),
            'description' => $data['description'] ?? null,
            'icon' => $data['icon'] ?? null,
            'color' => $data['color'] ?? null,
            'position' => (int) ($data['position'] ?? 0),
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Category $category, array $data): Category
    {
        if (isset($data['parent_id']) && (int) $data['parent_id'] === $category->id) {
            throw new BusinessRuleViolation(
                'A category cannot be its own parent.',
                'invalid_parent',
                422,
                ['field' => 'parent_id'],
            );
        }

        $attributes = array_filter([
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'icon' => $data['icon'] ?? null,
            'color' => $data['color'] ?? null,
            'position' => $data['position'] ?? null,
        ], static fn (mixed $v): bool => $v !== null);

        if (array_key_exists('parent_id', $data)) {
            $attributes['parent_id'] = $data['parent_id'];
        }

        if (array_key_exists('is_active', $data)) {
            $attributes['is_active'] = (bool) $data['is_active'];
        }

        if (isset($data['name']) && $data['name'] !== $category->name) {
            $attributes['slug'] = $this->slugs->unique(
                (string) $data['name'],
                fn (string $slug): bool => $this->categories->slugExists($slug, $category->id),
            );
        }

        return $this->categories->update($category, $attributes);
    }

    public function delete(Category $category): void
    {
        if ($this->categories->hasCourses($category)) {
            throw BusinessRuleViolation::conflict(
                'This category still has courses. Move them first.',
                'category_in_use',
            );
        }

        $this->categories->delete($category);
    }
}
