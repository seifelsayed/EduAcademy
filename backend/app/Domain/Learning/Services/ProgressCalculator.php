<?php

declare(strict_types=1);

namespace App\Domain\Learning\Services;

/**
 * Pure progress arithmetic. No framework, no persistence — trivially testable.
 */
final class ProgressCalculator
{
    public function __construct(
        private readonly int $completionThreshold = 100,
    ) {}

    public static function fromConfig(): self
    {
        return new self((int) config('platform.course_completion_threshold', 100));
    }

    /**
     * Percentage of a course completed, rounded to two decimals.
     */
    public function percentage(int $completedLessons, int $totalLessons): float
    {
        if ($totalLessons <= 0) {
            return 0.0;
        }

        $completedLessons = max(0, min($completedLessons, $totalLessons));

        return round(($completedLessons / $totalLessons) * 100, 2);
    }

    public function isComplete(float $percentage): bool
    {
        return $percentage >= $this->completionThreshold;
    }

    /**
     * How far through a video the learner is, capped at 100.
     */
    public function watchPercentage(int $watchedSeconds, ?int $durationSeconds): float
    {
        if ($durationSeconds === null || $durationSeconds <= 0) {
            return 0.0;
        }

        return round(min(100, ($watchedSeconds / $durationSeconds) * 100), 2);
    }

    /**
     * A video lesson auto-completes once the learner has watched at least 95%.
     */
    public function videoCountsAsWatched(int $watchedSeconds, ?int $durationSeconds): bool
    {
        return $this->watchPercentage($watchedSeconds, $durationSeconds) >= 95.0;
    }

    public function remainingLessons(int $completedLessons, int $totalLessons): int
    {
        return max(0, $totalLessons - $completedLessons);
    }
}
