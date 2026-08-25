<?php

declare(strict_types=1);

namespace App\Application\Catalog\UseCases;

use App\Application\Shared\Services\SlugGenerator;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Domain\Catalog\Enums\LessonType;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use Illuminate\Support\Str;

final readonly class ManageLessons
{
    public function __construct(
        private LessonRepositoryInterface $lessons,
        private CourseRepositoryInterface $courses,
        private SlugGenerator $slugs,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(Section $section, array $data): Lesson
    {
        $course = $section->course;
        $type = LessonType::from((string) ($data['type'] ?? LessonType::Video->value));

        $this->assertContentMatchesType($type, $data);

        $lesson = $this->lessons->create([
            'course_id' => $course->id,
            'section_id' => $section->id,
            'title' => $data['title'],
            'slug' => $this->slugs->unique(
                (string) $data['title'],
                fn (string $slug): bool => $course->lessons()->where('slug', $slug)->exists(),
            ),
            'type' => $type->value,
            'content' => $data['content'] ?? null,
            'video_url' => $data['video_url'] ?? null,
            'video_provider' => isset($data['video_url']) ? $this->detectProvider((string) $data['video_url']) : null,
            'video_duration_seconds' => $data['video_duration_seconds'] ?? null,
            'duration_minutes' => (int) ($data['duration_minutes'] ?? 0),
            'attachments' => $data['attachments'] ?? null,
            'position' => $this->lessons->nextPosition($section),
            'is_preview' => (bool) ($data['is_preview'] ?? false),
            'is_published' => (bool) ($data['is_published'] ?? true),
        ]);

        $this->courses->refreshAggregates($course);

        return $lesson;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Lesson $lesson, array $data): Lesson
    {
        $type = isset($data['type']) ? LessonType::from((string) $data['type']) : $lesson->type;

        $this->assertContentMatchesType($type, array_merge([
            'content' => $lesson->content,
            'video_url' => $lesson->video_url,
        ], $data));

        $attributes = array_filter([
            'title' => $data['title'] ?? null,
            'type' => $type->value,
            'content' => $data['content'] ?? null,
            'video_url' => $data['video_url'] ?? null,
            'video_duration_seconds' => $data['video_duration_seconds'] ?? null,
            'duration_minutes' => $data['duration_minutes'] ?? null,
            'attachments' => $data['attachments'] ?? null,
        ], static fn (mixed $v): bool => $v !== null);

        if (isset($data['video_url'])) {
            $attributes['video_provider'] = $this->detectProvider((string) $data['video_url']);
        }

        // Booleans need an explicit presence check — false is a real value.
        foreach (['is_preview', 'is_published'] as $flag) {
            if (array_key_exists($flag, $data)) {
                $attributes[$flag] = (bool) $data[$flag];
            }
        }

        $lesson = $this->lessons->update($lesson, $attributes);
        $this->courses->refreshAggregates($lesson->course);

        return $lesson;
    }

    public function delete(Lesson $lesson): void
    {
        $course = $lesson->course;

        $this->lessons->delete($lesson);
        $this->courses->refreshAggregates($course);
    }

    /**
     * @param  array<int, int>  $orderedIds
     */
    public function reorder(Section $section, array $orderedIds): void
    {
        $known = $this->lessons->forSection($section)->pluck('id')->all();
        $unknown = array_diff($orderedIds, $known);

        if ($unknown !== []) {
            throw new BusinessRuleViolation(
                'The ordering references lessons that do not belong to this section.',
                'invalid_lesson_order',
                422,
                ['unknown_ids' => array_values($unknown)],
            );
        }

        $this->lessons->reorder($section, $orderedIds);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function assertContentMatchesType(LessonType $type, array $data): void
    {
        if ($type->requiresMedia() && blank($data['video_url'] ?? null) && blank($data['attachments'] ?? null)) {
            throw new BusinessRuleViolation(
                'A video or resource lesson needs a video URL or an attachment.',
                'lesson_media_required',
                422,
                ['field' => 'video_url'],
            );
        }

        if ($type->requiresContentBody() && blank($data['content'] ?? null)) {
            throw new BusinessRuleViolation(
                'An article lesson needs content.',
                'lesson_content_required',
                422,
                ['field' => 'content'],
            );
        }
    }

    private function detectProvider(string $url): string
    {
        return match (true) {
            Str::contains($url, ['youtube.com', 'youtu.be']) => 'youtube',
            Str::contains($url, 'vimeo.com') => 'vimeo',
            default => 'external',
        };
    }
}
