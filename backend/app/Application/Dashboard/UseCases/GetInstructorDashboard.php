<?php

declare(strict_types=1);

namespace App\Application\Dashboard\UseCases;

use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class GetInstructorDashboard
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private OrderRepositoryInterface $orders,
        private ReviewRepositoryInterface $reviews,
        private SubmissionRepositoryInterface $submissions,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(User $instructor, int $days = 30): array
    {
        $courseStats = $this->courses->statistics($instructor->id);

        return [
            'stats' => [
                ...$courseStats,
                'students' => $this->enrollments->countForInstructor($instructor),
                'revenue_cents' => $this->orders->totalRevenueCents($instructor->id),
                'currency' => config('platform.currency', 'USD'),
                'average_rating' => $this->reviews->averageRatingForInstructor($instructor),
                'pending_submissions' => $this->submissions->countPendingForInstructor($instructor),
            ],
            'charts' => [
                'enrollments' => $this->enrollments->dailyCounts($days, $instructor->id),
                'revenue' => $this->orders->dailyRevenueCents($days, $instructor->id),
            ],
            'top_courses' => $instructor->courses()
                ->orderByDesc('students_count')
                ->limit(5)
                ->get(),

            'recent_reviews' => $instructor->courses()
                ->with(['reviews' => fn ($q) => $q->with('user:id,name,avatar_path')->latest()->limit(5)])
                ->get()
                ->pluck('reviews')
                ->flatten()
                ->sortByDesc('created_at')
                ->take(5)
                ->values(),
        ];
    }
}
