<?php

declare(strict_types=1);

use App\Presentation\Http\Controllers\Api\V1\Admin\UserController;
use App\Presentation\Http\Controllers\Api\V1\AssignmentController;
use App\Presentation\Http\Controllers\Api\V1\AuthController;
use App\Presentation\Http\Controllers\Api\V1\CategoryController;
use App\Presentation\Http\Controllers\Api\V1\CertificateController;
use App\Presentation\Http\Controllers\Api\V1\CourseController;
use App\Presentation\Http\Controllers\Api\V1\DashboardController;
use App\Presentation\Http\Controllers\Api\V1\EnrollmentController;
use App\Presentation\Http\Controllers\Api\V1\LearningController;
use App\Presentation\Http\Controllers\Api\V1\LessonController;
use App\Presentation\Http\Controllers\Api\V1\OrderController;
use App\Presentation\Http\Controllers\Api\V1\ProfileController;
use App\Presentation\Http\Controllers\Api\V1\QuizAttemptController;
use App\Presentation\Http\Controllers\Api\V1\QuizController;
use App\Presentation\Http\Controllers\Api\V1\ReviewController;
use App\Presentation\Http\Controllers\Api\V1\SectionController;
use App\Presentation\Http\Controllers\Api\V1\SubmissionController;
use App\Presentation\Http\Controllers\Api\V1\WishlistController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    /*
    |--------------------------------------------------------------------------
    | Public
    |--------------------------------------------------------------------------
    */
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');

    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);

    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/featured', [CourseController::class, 'featured']);
    Route::get('courses/{slug}', [CourseController::class, 'show']);

    Route::get('certificates/verify/{serial}', [CertificateController::class, 'verify']);

    /*
    |--------------------------------------------------------------------------
    | Authenticated
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {

        // --- Account -------------------------------------------------------
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::patch('profile', [ProfileController::class, 'update']);
        Route::post('profile/password', [ProfileController::class, 'changePassword']);

        // --- Dashboards ----------------------------------------------------
        Route::get('dashboard/student', [DashboardController::class, 'student']);
        Route::get('dashboard/instructor', [DashboardController::class, 'instructor']);
        Route::get('dashboard/admin', [DashboardController::class, 'admin']);

        // --- Learning ------------------------------------------------------
        Route::get('my/enrollments', [EnrollmentController::class, 'index']);
        Route::get('my/wishlist', [WishlistController::class, 'index']);
        Route::get('my/certificates', [CertificateController::class, 'index']);
        Route::get('my/orders', [OrderController::class, 'index']);

        Route::post('courses/{course}/enroll', [EnrollmentController::class, 'store']);
        Route::get('courses/{course}/enrollment', [EnrollmentController::class, 'show']);
        Route::get('courses/{course}/player', [LearningController::class, 'player']);
        Route::post('courses/{course}/wishlist', [WishlistController::class, 'toggle']);
        Route::post('courses/{course}/certificate', [CertificateController::class, 'store']);

        Route::get('lessons/{lesson}', [LessonController::class, 'show']);
        Route::post('lessons/{lesson}/progress', [LearningController::class, 'trackProgress']);
        Route::post('lessons/{lesson}/complete', [LearningController::class, 'complete']);

        // --- Assessment (learner side) --------------------------------------
        Route::post('quizzes/{quiz}/attempts', [QuizAttemptController::class, 'start']);
        Route::get('quizzes/{quiz}/attempts', [QuizAttemptController::class, 'history']);
        Route::get('attempts/{attempt}', [QuizAttemptController::class, 'show']);
        Route::post('attempts/{attempt}/submit', [QuizAttemptController::class, 'submit']);

        Route::get('assignments/{assignment}', [AssignmentController::class, 'show']);
        Route::post('assignments/{assignment}/submissions', [SubmissionController::class, 'store']);
        Route::get('submissions/{submission}', [SubmissionController::class, 'show']);

        // --- Reviews --------------------------------------------------------
        Route::post('courses/{course}/reviews', [ReviewController::class, 'store']);
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy']);
        Route::post('reviews/{review}/reply', [ReviewController::class, 'reply']);

        // --- Billing ---------------------------------------------------------
        Route::get('courses/{course}/quote', [OrderController::class, 'quote']);
        Route::post('courses/{course}/orders', [OrderController::class, 'store']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::post('orders/{order}/confirm', [OrderController::class, 'confirm']);

        /*
        |----------------------------------------------------------------------
        | Instructor — course authoring
        |----------------------------------------------------------------------
        */
        Route::prefix('instructor')->group(function (): void {
            Route::get('courses', [CourseController::class, 'mine']);
            Route::get('submissions/pending', [SubmissionController::class, 'pending']);
        });

        Route::post('courses', [CourseController::class, 'store'])->middleware('throttle:uploads');
        Route::post('courses/{course}', [CourseController::class, 'update'])->middleware('throttle:uploads');
        Route::patch('courses/{course}', [CourseController::class, 'update']);
        Route::delete('courses/{course}', [CourseController::class, 'destroy']);

        Route::get('courses/{course}/readiness', [CourseController::class, 'readiness']);
        Route::post('courses/{course}/publish', [CourseController::class, 'publish']);
        Route::post('courses/{course}/unpublish', [CourseController::class, 'unpublish']);
        Route::post('courses/{course}/archive', [CourseController::class, 'archive']);
        Route::get('courses/{course}/students', [EnrollmentController::class, 'roster']);
        Route::get('courses/{course}/assignments', [AssignmentController::class, 'index']);

        Route::get('courses/{course}/sections', [SectionController::class, 'index']);
        Route::post('courses/{course}/sections', [SectionController::class, 'store']);
        Route::post('courses/{course}/sections/reorder', [SectionController::class, 'reorder']);
        Route::patch('sections/{section}', [SectionController::class, 'update']);
        Route::delete('sections/{section}', [SectionController::class, 'destroy']);

        Route::post('sections/{section}/lessons', [LessonController::class, 'store']);
        Route::post('sections/{section}/lessons/reorder', [LessonController::class, 'reorder']);
        Route::patch('lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('lessons/{lesson}', [LessonController::class, 'destroy']);

        Route::put('lessons/{lesson}/quiz', [QuizController::class, 'upsert']);
        Route::get('quizzes/{quiz}', [QuizController::class, 'show']);
        Route::delete('quizzes/{quiz}', [QuizController::class, 'destroy']);
        Route::post('quizzes/{quiz}/questions', [QuizController::class, 'storeQuestion']);
        Route::patch('questions/{question}', [QuizController::class, 'updateQuestion']);
        Route::delete('questions/{question}', [QuizController::class, 'destroyQuestion']);

        Route::put('lessons/{lesson}/assignment', [AssignmentController::class, 'upsert']);
        Route::delete('assignments/{assignment}', [AssignmentController::class, 'destroy']);
        Route::get('assignments/{assignment}/submissions', [SubmissionController::class, 'index']);
        Route::post('submissions/{submission}/grade', [SubmissionController::class, 'grade']);
        Route::post('submissions/{submission}/return', [SubmissionController::class, 'returnForRevision']);

        /*
        |----------------------------------------------------------------------
        | Admin
        |----------------------------------------------------------------------
        */
        Route::prefix('admin')->group(function (): void {
            Route::get('users', [UserController::class, 'index']);
            Route::post('users', [UserController::class, 'store']);
            Route::get('users/{user}', [UserController::class, 'show']);
            Route::patch('users/{user}', [UserController::class, 'update']);
            Route::delete('users/{user}', [UserController::class, 'destroy']);

            // Bound by id, not slug: renaming a category changes its slug, and
            // an admin editing it should not have to chase the new one.
            Route::post('categories', [CategoryController::class, 'store']);
            Route::patch('categories/{category:id}', [CategoryController::class, 'update']);
            Route::delete('categories/{category:id}', [CategoryController::class, 'destroy']);

            Route::get('orders', [OrderController::class, 'adminIndex']);
            Route::post('orders/{order}/refund', [OrderController::class, 'refund']);
        });
    });
});

// Public course reviews sit outside the auth group but after it, so the
// {course} binding still resolves by slug.
Route::get('v1/courses/{course}/reviews', [ReviewController::class, 'index']);
