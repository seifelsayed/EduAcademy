<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Learning\UseCases\GetCoursePlayer;
use App\Application\Learning\UseCases\TrackLessonProgress;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Learning\TrackProgressRequest;
use App\Presentation\Http\Resources\CourseDetailResource;
use App\Presentation\Http\Resources\EnrollmentResource;
use App\Presentation\Http\Resources\LessonResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Everything the course player screen talks to.
 */
final class LearningController extends Controller
{
    public function __construct(
        private readonly EnrollmentRepositoryInterface $enrollments,
        private readonly TrackLessonProgress $tracker,
    ) {}

    public function player(Request $request, Course $course, GetCoursePlayer $useCase): JsonResponse
    {
        $player = $useCase->execute(
            $this->user($request),
            $course,
            $request->string('lesson')->toString() ?: null,
        );

        $completedIds = $player['completed_lesson_ids'];

        // The learner has access to the whole course, so unlock every lesson
        // and stamp each with its completion state.
        foreach ($player['course']->sections as $section) {
            foreach ($section->lessons as $lesson) {
                $lesson->has_access = true;
                $lesson->is_completed = in_array((int) $lesson->id, $completedIds, true);
            }
        }

        $current = $player['current_lesson'];

        if ($current !== null) {
            $current->has_access = true;
            $current->is_completed = in_array((int) $current->id, $completedIds, true);
            $current->last_position_seconds = $this->resumePosition($player['enrollment'], $current);
            $current->loadMissing(['quiz', 'assignment']);
        }

        return ApiResponse::success([
            'course' => new CourseDetailResource($player['course']),
            'enrollment' => new EnrollmentResource($player['enrollment']),
            'current_lesson' => $current !== null ? new LessonResource($current) : null,
            'next_lesson' => $this->navigationStub($player['next_lesson']),
            'previous_lesson' => $this->navigationStub($player['previous_lesson']),
            'completed_lesson_ids' => $completedIds,
            'total_watched_seconds' => $player['total_watched_seconds'],
        ]);
    }

    public function trackProgress(TrackProgressRequest $request, Lesson $lesson): JsonResponse
    {
        $enrollment = $this->requireEnrollment($request, $lesson);

        $progress = $this->tracker->record(
            $enrollment,
            $lesson,
            $request->integer('watched_seconds'),
            $request->integer('position_seconds'),
        );

        return ApiResponse::success([
            'is_completed' => $progress->is_completed,
            'watched_seconds' => $progress->watched_seconds,
            'last_position_seconds' => $progress->last_position_seconds,
            'enrollment' => new EnrollmentResource($enrollment->refresh()),
        ]);
    }

    public function complete(Request $request, Lesson $lesson): JsonResponse
    {
        $enrollment = $this->requireEnrollment($request, $lesson);

        $updated = $this->tracker->complete($enrollment, $lesson, ! $request->boolean('undo'));

        return ApiResponse::success(
            new EnrollmentResource($updated),
            $request->boolean('undo') ? 'Lesson marked as not complete.' : 'Lesson completed.',
        );
    }

    private function requireEnrollment(Request $request, Lesson $lesson)
    {
        $enrollment = $this->enrollments->findFor($this->user($request), $lesson->course);

        if ($enrollment === null) {
            throw BusinessRuleViolation::forbidden(
                'Enrol in this course to track progress.',
                'not_enrolled',
            );
        }

        return $enrollment;
    }

    private function resumePosition($enrollment, Lesson $lesson): int
    {
        return (int) ($lesson->progress()
            ->where('enrollment_id', $enrollment->id)
            ->value('last_position_seconds') ?? 0);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function navigationStub(?Lesson $lesson): ?array
    {
        if ($lesson === null) {
            return null;
        }

        return [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'slug' => $lesson->slug,
            'type' => $lesson->type->value,
        ];
    }
}
