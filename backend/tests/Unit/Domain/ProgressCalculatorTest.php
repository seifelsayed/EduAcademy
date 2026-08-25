<?php

declare(strict_types=1);

namespace Tests\Unit\Domain;

use App\Domain\Learning\Services\ProgressCalculator;
use PHPUnit\Framework\TestCase;

final class ProgressCalculatorTest extends TestCase
{
    private ProgressCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calculator = new ProgressCalculator(completionThreshold: 100);
    }

    public function test_percentage_rounds_to_two_decimals(): void
    {
        $this->assertSame(33.33, $this->calculator->percentage(1, 3));
        $this->assertSame(66.67, $this->calculator->percentage(2, 3));
    }

    public function test_a_course_with_no_lessons_reports_zero(): void
    {
        $this->assertSame(0.0, $this->calculator->percentage(0, 0));
        $this->assertSame(0.0, $this->calculator->percentage(5, 0));
    }

    public function test_completed_count_cannot_exceed_the_total(): void
    {
        $this->assertSame(100.0, $this->calculator->percentage(12, 10));
    }

    public function test_completion_uses_the_configured_threshold(): void
    {
        $lenient = new ProgressCalculator(completionThreshold: 80);

        $this->assertTrue($lenient->isComplete(80.0));
        $this->assertFalse($this->calculator->isComplete(99.9));
        $this->assertTrue($this->calculator->isComplete(100.0));
    }

    public function test_a_video_counts_as_watched_at_ninety_five_percent(): void
    {
        $this->assertTrue($this->calculator->videoCountsAsWatched(95, 100));
        $this->assertFalse($this->calculator->videoCountsAsWatched(94, 100));
    }

    public function test_watch_percentage_is_capped_and_tolerates_unknown_duration(): void
    {
        $this->assertSame(100.0, $this->calculator->watchPercentage(500, 100));
        $this->assertSame(0.0, $this->calculator->watchPercentage(500, null));
        $this->assertSame(0.0, $this->calculator->watchPercentage(500, 0));
    }
}
