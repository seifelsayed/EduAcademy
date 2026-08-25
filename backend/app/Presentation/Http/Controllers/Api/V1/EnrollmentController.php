<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Learning\UseCases\EnrollInCourse;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Learning\Enums\EnrollmentStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\EnrollmentResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EnrollmentController extends Controller
{
    public function __construct(
        private readonly EnrollmentRepositoryInterface $enrollments,
    ) {}

    /**
     * The signed-in learner's enrolments ("My learning").
     */
    public function index(Request $request): JsonResponse
    {
        $status = EnrollmentStatus::tryFrom($request->string('status')->toString());

        $paginator = $this->enrollments->paginateForStudent(
            $this->user($request),
            $status,
            $this->perPage($request),
        );

        return ApiResponse::paginated($paginator, EnrollmentResource::class);
    }

    public function store(Request $request, Course $course, EnrollInCourse $useCase): JsonResponse
    {
        $enrollment = $useCase->execute($this->user($request), $course);

        return ApiResponse::created(
            new EnrollmentResource($enrollment),
            'You are enrolled. Happy learning!',
        );
    }

    /**
     * The learner's enrolment for a specific course, or 404 when absent.
     */
    public function show(Request $request, Course $course): JsonResponse
    {
        $enrollment = $this->enrollments->findFor($this->user($request), $course);

        if ($enrollment === null) {
            return ApiResponse::error('You are not enrolled in this course.', 'not_enrolled', 404);
        }

        return ApiResponse::success(
            new EnrollmentResource($enrollment->load(['course', 'lastLesson', 'certificate']))
        );
    }

    /**
     * Course roster, for the instructor.
     */
    public function roster(Request $request, Course $course): JsonResponse
    {
        $this->authorize('manageStudents', $course);

        $paginator = $this->enrollments->paginateForCourse($course, $this->perPage($request));

        return ApiResponse::paginated($paginator, EnrollmentResource::class);
    }
}
