<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Section>
 */
interface SectionRepositoryInterface extends Repository
{
    /**
     * @return Collection<int, Section>
     */
    public function forCourse(Course $course): Collection;

    public function nextPosition(Course $course): int;

    /**
     * Persists a new ordering.
     *
     * @param  array<int, int>  $orderedIds  Section ids in their new order.
     */
    public function reorder(Course $course, array $orderedIds): void;
}
