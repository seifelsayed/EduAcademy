<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Assessment\UseCases\GradeSubmission;
use App\Application\Assessment\UseCases\SubmitAssignment;
use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Domain\Assessment\Enums\SubmissionStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Submission;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Assessment\GradeSubmissionRequest;
use App\Presentation\Http\Requests\Assessment\SubmitAssignmentRequest;
use App\Presentation\Http\Resources\SubmissionResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SubmissionController extends Controller
{
    public function __construct(
        private readonly SubmissionRepositoryInterface $submissions,
    ) {}

    public function store(SubmitAssignmentRequest $request, Assignment $assignment, SubmitAssignment $useCase): JsonResponse
    {
        $submission = $useCase->execute(
            $this->user($request),
            $assignment,
            $request->safe()->except('as_draft'),
            $request->boolean('as_draft'),
        );

        return ApiResponse::success(
            new SubmissionResource($submission),
            $request->boolean('as_draft') ? 'Draft saved.' : 'Assignment submitted.',
        );
    }

    public function show(Request $request, Submission $submission): JsonResponse
    {
        $this->authorize('view', $submission);

        return ApiResponse::success(
            new SubmissionResource($submission->load(['user', 'grader', 'assignment']))
        );
    }

    /**
     * Every submission for one assignment, for the instructor.
     */
    public function index(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('manageStudents', $assignment->lesson->course);

        $status = SubmissionStatus::tryFrom($request->string('status')->toString());

        $paginator = $this->submissions->paginateForAssignment($assignment, $status, $this->perPage($request));

        return ApiResponse::paginated($paginator, SubmissionResource::class);
    }

    /**
     * The instructor's grading queue across all their courses.
     */
    public function pending(Request $request): JsonResponse
    {
        $this->authorize('access-instructor');

        $paginator = $this->submissions->paginatePendingForInstructor(
            $this->user($request),
            $this->perPage($request),
        );

        return ApiResponse::paginated($paginator, SubmissionResource::class);
    }

    public function grade(GradeSubmissionRequest $request, Submission $submission, GradeSubmission $useCase): JsonResponse
    {
        $graded = $useCase->execute(
            $this->user($request),
            $submission,
            $request->integer('score'),
            $request->string('feedback')->toString() ?: null,
        );

        return ApiResponse::success(new SubmissionResource($graded), 'Submission graded.');
    }

    public function returnForRevision(Request $request, Submission $submission, GradeSubmission $useCase): JsonResponse
    {
        $this->authorize('grade', $submission);

        $validated = $request->validate([
            'feedback' => ['required', 'string', 'max:5000'],
        ]);

        $returned = $useCase->returnForRevision($this->user($request), $submission, $validated['feedback']);

        return ApiResponse::success(new SubmissionResource($returned), 'Sent back for revision.');
    }
}
