<?php

declare(strict_types=1);

namespace App\Application\Dashboard\UseCases;

use App\Domain\Engagement\Contracts\CertificateRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Enrollment;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class GetStudentDashboard
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollments,
        private CertificateRepositoryInterface $certificates,
    ) {}

    /**
     * @return array{
     *     stats: array{enrolled: int, in_progress: int, completed: int, certificates: int, average_progress: float},
     *     continue_learning: \Illuminate\Database\Eloquent\Collection<int, Enrollment>,
     *     recent_certificates: \Illuminate\Database\Eloquent\Collection<int, \App\Infrastructure\Persistence\Eloquent\Models\Certificate>
     * }
     */
    public function execute(User $student): array
    {
        $all = $student->enrollments()->get();

        $completed = $all->where('status', EnrollmentStatus::Completed)->count();
        $inProgress = $all->where('status', EnrollmentStatus::Active)->count();

        return [
            'stats' => [
                'enrolled' => $all->count(),
                'in_progress' => $inProgress,
                'completed' => $completed,
                'certificates' => $this->certificates->forStudent($student)->count(),
                'average_progress' => $all->isEmpty()
                    ? 0.0
                    : round((float) $all->avg('progress_percent'), 2),
            ],
            'continue_learning' => $this->enrollments->recentlyActive($student, 6),
            'recent_certificates' => $this->certificates->forStudent($student)->take(3),
        ];
    }
}
