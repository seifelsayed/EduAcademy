<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Category>
 */
interface CategoryRepositoryInterface extends Repository
{
    public function findBySlug(string $slug): ?Category;

    public function slugExists(string $slug, ?int $exceptId = null): bool;

    /**
     * Root categories with their children, ordered for menu rendering.
     *
     * @return Collection<int, Category>
     */
    public function tree(): Collection;

    /**
     * Categories annotated with the number of published courses.
     *
     * @return Collection<int, Category>
     */
    public function withPublishedCourseCounts(): Collection;

    public function hasCourses(Category $category): bool;
}
