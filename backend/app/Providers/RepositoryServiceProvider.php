<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Assessment\Contracts\AssignmentRepositoryInterface;
use App\Domain\Assessment\Contracts\QuizAttemptRepositoryInterface;
use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Billing\Services\PricingService;
use App\Domain\Catalog\Contracts\CategoryRepositoryInterface;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Catalog\Contracts\LessonRepositoryInterface;
use App\Domain\Catalog\Contracts\SectionRepositoryInterface;
use App\Domain\Engagement\Contracts\CertificateRepositoryInterface;
use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Contracts\LessonProgressRepositoryInterface;
use App\Domain\Learning\Services\ProgressCalculator;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Infrastructure\Persistence\DatabaseTransactionManager;
use App\Infrastructure\Persistence\Eloquent\Repositories\AssignmentRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\CategoryRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\CertificateRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\CourseRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\EnrollmentRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\LessonProgressRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\LessonRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\OrderRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\QuizAttemptRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\QuizRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\ReviewRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\SectionRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\SubmissionRepository;
use App\Infrastructure\Persistence\Eloquent\Repositories\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Wires every Domain port to its Infrastructure adapter. This is the single
 * place where the outer layers are bound to the inner ones.
 */
final class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    private const REPOSITORIES = [
        UserRepositoryInterface::class => UserRepository::class,
        CategoryRepositoryInterface::class => CategoryRepository::class,
        CourseRepositoryInterface::class => CourseRepository::class,
        SectionRepositoryInterface::class => SectionRepository::class,
        LessonRepositoryInterface::class => LessonRepository::class,
        EnrollmentRepositoryInterface::class => EnrollmentRepository::class,
        LessonProgressRepositoryInterface::class => LessonProgressRepository::class,
        QuizRepositoryInterface::class => QuizRepository::class,
        QuizAttemptRepositoryInterface::class => QuizAttemptRepository::class,
        AssignmentRepositoryInterface::class => AssignmentRepository::class,
        SubmissionRepositoryInterface::class => SubmissionRepository::class,
        ReviewRepositoryInterface::class => ReviewRepository::class,
        CertificateRepositoryInterface::class => CertificateRepository::class,
        OrderRepositoryInterface::class => OrderRepository::class,
    ];

    public function register(): void
    {
        foreach (self::REPOSITORIES as $contract => $implementation) {
            $this->app->bind($contract, $implementation);
        }

        $this->app->bind(TransactionManager::class, DatabaseTransactionManager::class);

        // Domain services are configuration-driven, so build them from config.
        $this->app->singleton(ProgressCalculator::class, static fn (): ProgressCalculator => ProgressCalculator::fromConfig());
        $this->app->singleton(PricingService::class, static fn (): PricingService => PricingService::fromConfig());
    }

    /**
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [
            ...array_keys(self::REPOSITORIES),
            TransactionManager::class,
            ProgressCalculator::class,
            PricingService::class,
        ];
    }
}
