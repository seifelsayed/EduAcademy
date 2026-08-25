<?php

declare(strict_types=1);

namespace App\Application\Dashboard\UseCases;

use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\User\Contracts\UserRepositoryInterface;

final readonly class GetAdminDashboard
{
    public function __construct(
        private UserRepositoryInterface $users,
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private OrderRepositoryInterface $orders,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function execute(int $days = 30): array
    {
        return [
            'stats' => [
                'users' => $this->users->statistics(),
                'courses' => $this->courses->statistics(),
                'revenue_cents' => $this->orders->totalRevenueCents(),
                'currency' => config('platform.currency', 'USD'),
            ],
            'charts' => [
                'enrollments' => $this->enrollments->dailyCounts($days),
                'revenue' => $this->orders->dailyRevenueCents($days),
            ],
            'top_instructors' => $this->users->topInstructors(5),
            'featured_courses' => $this->courses->featured(5),
        ];
    }
}
