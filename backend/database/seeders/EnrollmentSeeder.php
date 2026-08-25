<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Seeder;

final class EnrollmentSeeder extends Seeder
{
    public function __construct(
        private readonly CourseRepositoryInterface $courses,
    ) {}

    public function run(): void
    {
        $courses = Course::query()->published()->with('lessons')->get();
        $students = User::query()->where('role', 'student')->get();

        if ($courses->isEmpty() || $students->isEmpty()) {
            return;
        }

        foreach ($students as $student) {
            foreach ($courses->random(min(4, $courses->count())) as $course) {
                if ($course->instructor_id === $student->id) {
                    continue;
                }

                $this->enrol($student, $course);
            }
        }

        // Give the demo learner a predictable spread of progress, so every state
        // in the UI (not started, part-way, finished) has an example.
        $demo = User::query()->where('email', 'student@education.test')->first();

        if ($demo !== null) {
            foreach ($courses->take(5)->values() as $index => $course) {
                $this->enrol($demo, $course, forcedProgress: [0.0, 25.0, 60.0, 90.0, 100.0][$index] ?? 0.0);
            }
        }

        // Student counters are derived, so recompute them once at the end rather
        // than incrementing per row (which double-counts on a re-run).
        foreach ($courses as $course) {
            $this->courses->refreshAggregates($course);
        }
    }

    private function enrol(User $student, Course $course, ?float $forcedProgress = null): void
    {
        $lessons = $course->lessons;

        if ($lessons->isEmpty()) {
            return;
        }

        $progress = $forcedProgress ?? (float) fake()->randomElement([0, 15, 35, 50, 75, 100]);
        $completedCount = (int) round(($progress / 100) * $lessons->count());

        $enrollment = Enrollment::query()->firstOrCreate(
            ['user_id' => $student->id, 'course_id' => $course->id],
            [
                'status' => $progress >= 100
                    ? EnrollmentStatus::Completed->value
                    : EnrollmentStatus::Active->value,
                'progress_percent' => $progress,
                'completed_lessons_count' => $completedCount,
                'enrolled_at' => now()->subDays(fake()->numberBetween(10, 120)),
                'last_accessed_at' => now()->subDays(fake()->numberBetween(1, 10)),
                'completed_at' => $progress >= 100 ? now()->subDays(fake()->numberBetween(1, 5)) : null,
                'last_lesson_id' => $lessons->get(max(0, $completedCount - 1))?->id,
            ],
        );

        // The per-lesson rows have to agree with the summary counters, otherwise
        // the player and the dashboard disagree about the same enrolment.
        foreach ($lessons->take($completedCount) as $lesson) {
            $enrollment->lessonProgress()->firstOrCreate(
                ['lesson_id' => $lesson->id],
                [
                    'is_completed' => true,
                    'watched_seconds' => $lesson->video_duration_seconds ?? 0,
                    'last_position_seconds' => $lesson->video_duration_seconds ?? 0,
                    'completed_at' => now()->subDays(fake()->numberBetween(1, 5)),
                ],
            );
        }
    }
}
