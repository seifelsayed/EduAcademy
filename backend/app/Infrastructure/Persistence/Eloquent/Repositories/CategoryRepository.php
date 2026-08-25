<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Catalog\Contracts\CategoryRepositoryInterface;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Category>
 */
final class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    protected function model(): string
    {
        return Category::class;
    }

    public function findBySlug(string $slug): ?Category
    {
        return $this->query()->where('slug', $slug)->first();
    }

    public function slugExists(string $slug, ?int $exceptId = null): bool
    {
        return $this->query()
            ->where('slug', $slug)
            ->when($exceptId !== null, fn ($q) => $q->whereKeyNot($exceptId))
            ->exists();
    }

    public function tree(): Collection
    {
        return $this->query()
            ->active()
            ->roots()
            ->with(['children' => fn ($q) => $q->where('is_active', true)])
            ->orderBy('position')
            ->orderBy('name')
            ->get();
    }

    public function withPublishedCourseCounts(): Collection
    {
        return $this->query()
            ->active()
            ->withCount([
                'courses as courses_count' => fn ($q) => $q->where('status', CourseStatus::Published->value),
            ])
            ->orderBy('position')
            ->orderBy('name')
            ->get();
    }

    public function hasCourses(Category $category): bool
    {
        return $category->courses()->exists();
    }
}
