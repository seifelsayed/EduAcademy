<?php

declare(strict_types=1);

namespace App\Application\Learning\UseCases;

use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Contracts\LessonProgressRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Domain\Learning\Services\ProgressCalculator;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\LessonProgress;

final readonly class TrackLessonProgress
{
    public function __construct(
        private LessonProgressRepositoryInterface $progress,
        private EnrollmentRepositoryInterface $enrollments,
        private LessonRepositoryInterface $lessons,
        private ProgressCalculator $calculator,
        private TransactionManager $transaction,
    ) {}

    /**
     * Records playback position. Video lessons auto-complete once watched.
     */
    public function record(Enrollment $enrollment, Lesson $lesson, int $watchedSeconds, int $positionSeconds): LessonProgress
    {
        $this->assertLessonBelongsToEnrollment($enrollment, $lesson);

        $existing = $this->progress->findFor($enrollment, $lesson);
        // Watch time only ever moves forward — re-scrubbing must not reduce it.
        $watched = max($watchedSeconds, $existing?->watched_seconds ?? 0);

        $shouldComplete = $existing?->is_completed
            ?? $this->calculator->videoCountsAsWatched($watched, $lesson->video_duration_seconds);

        return $this->transaction->run(function () use ($enrollment, $lesson, $watched, $positionSeconds, $shouldComplete): LessonProgress {
            $progress = $this->progress->upsertFor($enrollment, $lesson, [
                'watched_seconds' => $watched,
                'last_position_seconds' => max(0, $positionSeconds),
                'is_completed' => $shouldComplete,
                'completed_at' => $shouldComplete ? (now()) : null,
            ]);

            $this->enrollments->update($enrollment, [
                'last_lesson_id' => $lesson->id,
                'last_accessed_at' => now(),
            ]);

            $this->recalculate($enrollment);

            return $progress;
        });
    }

    /**
     * Explicit "mark as complete" from the learner.
     */
    public function complete(Enrollment $enrollment, Lesson $lesson, bool $completed = true): Enrollment
    {
        $this->assertLessonBelongsToEnrollment($enrollment, $lesson);

        return $this->transaction->run(function () use ($enrollment, $lesson, $completed): Enrollment {
            $this->progress->upsertFor($enrollment, $lesson, [
                'is_completed' => $completed,
                'completed_at' => $completed ? now() : null,
            ]);

            $this->enrollments->update($enrollment, [
                'last_lesson_id' => $lesson->id,
                'last_accessed_at' => now(),
            ]);

            return $this->recalculate($enrollment);
        });
    }

    /**
     * Recomputes the enrolment's percentage and flips it to completed when the
     * threshold is reached.
     */
    public function recalculate(Enrollment $enrollment): Enrollment
    {
        $totalLessons = $this->lessons->countForCourse($enrollment->course);
        $completedLessons = $this->progress->countCompleted($enrollment);
        $percentage = $this->calculator->percentage($completedLessons, $totalLessons);
        $isComplete = $totalLessons > 0 && $this->calculator->isComplete($percentage);

        $attributes = [
            'progress_percent' => $percentage,
            'completed_lessons_count' => $completedLessons,
        ];

        if ($isComplete && ! $enrollment->isCompleted()) {
            $attributes['status'] = EnrollmentStatus::Completed->value;
            $attributes['completed_at'] = now();
        } elseif (! $isComplete && $enrollment->isCompleted()) {
            // Progress can regress if the instructor adds new lessons.
            $attributes['status'] = EnrollmentStatus::Active->value;
            $attributes['completed_at'] = null;
        }

        return $this->enrollments->update($enrollment, $attributes);
    }

    private function assertLessonBelongsToEnrollment(Enrollment $enrollment, Lesson $lesson): void
    {
        if ($lesson->course_id !== $enrollment->course_id) {
            throw new BusinessRuleViolation(
                'That lesson is not part of this course.',
                'lesson_course_mismatch',
                422,
            );
        }

        if (! $enrollment->grantsAccess()) {
            throw BusinessRuleViolation::forbidden(
                'Your enrolment is no longer active.',
                'enrollment_inactive',
                ['status' => $enrollment->status->value],
            );
        }
    }
}
