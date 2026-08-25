<?php

declare(strict_types=1);

namespace App\Providers;

use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use App\Presentation\Policies\CoursePolicy;
use App\Presentation\Policies\LessonPolicy;
use App\Presentation\Policies\ReviewPolicy;
use App\Presentation\Policies\SubmissionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Policies are registered explicitly rather than by Laravel's naming
 * convention, because the models live under Infrastructure and the policies
 * under Presentation — the convention would not find them.
 */
final class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    private const POLICIES = [
        Course::class => CoursePolicy::class,
        Lesson::class => LessonPolicy::class,
        Submission::class => SubmissionPolicy::class,
        Review::class => ReviewPolicy::class,
    ];

    public function boot(): void
    {
        foreach (self::POLICIES as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Gate::define('access-admin', static fn (User $user): bool => $user->isAdmin());

        Gate::define('access-instructor', static fn (User $user): bool => $user->canTeach());
    }
}
