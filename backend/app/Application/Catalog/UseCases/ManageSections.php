<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Contracts\SectionRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Section;

final readonly class ManageSections
{
    public function __construct(
        private SectionRepositoryInterface $sections,
        private CourseRepositoryInterface $courses,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Course $course, array $data): Section
    {
        $section = $this->sections->create([
            'course_id' => $course->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'position' => $this->sections->nextPosition($course),
        ]);

        $this->courses->refreshAggregates($course);

        return $section;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Section $section, array $data): Section
    {
        return $this->sections->update($section, array_filter([
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
        ], static fn (mixed $v): bool => $v !== null));
    }

    public function delete(Section $section): void
    {
        $course = $section->course;

        $this->sections->delete($section);
        $this->courses->refreshAggregates($course);
    }

    /**
     * @param  array<int, int>  $orderedIds
     */
    public function reorder(Course $course, array $orderedIds): void
    {
        $known = $this->sections->forCourse($course)->pluck('id')->all();
        $unknown = array_diff($orderedIds, $known);

        if ($unknown !== []) {
            throw new BusinessRuleViolation(
                'The ordering references sections that do not belong to this course.',
                'invalid_section_order',
                422,
                ['unknown_ids' => array_values($unknown)],
            );
        }

        $this->sections->reorder($course, $orderedIds);
    }
}
