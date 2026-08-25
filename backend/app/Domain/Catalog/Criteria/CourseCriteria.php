<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Criteria;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;

/**
 * Immutable description of "which courses do I want" — a specification the
 * repository translates into a query. Keeps SQL out of the Application layer.
 */
final readonly class CourseCriteria
{
    /**
     * @param  array<int, int>  $categoryIds
     */
    public function __construct(
        public ?string $search = null,
        public array $categoryIds = [],
        public ?CourseLevel $level = null,
        public ?CourseStatus $status = null,
        public ?int $instructorId = null,
        public ?bool $freeOnly = null,
        public ?float $minRating = null,
        public string $sort = 'newest',
        public int $page = 1,
        public int $perPage = 15,
    ) {}

    /**
     * @return array<int, string>
     */
    public static function sortOptions(): array
    {
        return ['newest', 'oldest', 'popular', 'rating', 'price_asc', 'price_desc', 'title'];
    }

    public function withStatus(?CourseStatus $status): self
    {
        return new self(
            $this->search,
            $this->categoryIds,
            $this->level,
            $status,
            $this->instructorId,
            $this->freeOnly,
            $this->minRating,
            $this->sort,
            $this->page,
            $this->perPage,
        );
    }

    public function withInstructor(?int $instructorId): self
    {
        return new self(
            $this->search,
            $this->categoryIds,
            $this->level,
            $this->status,
            $instructorId,
            $this->freeOnly,
            $this->minRating,
            $this->sort,
            $this->page,
            $this->perPage,
        );
    }
}
