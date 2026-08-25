<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Domain\Assessment\Contracts\AssignmentRepositoryInterface;
use App\Domain\Assessment\Contracts\SubmissionRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Assignment;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Assessment\StoreAssignmentRequest;
use App\Presentation\Http\Resources\AssignmentResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AssignmentController extends Controller
{
    public function __construct(
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly SubmissionRepositoryInterface $submissions,
    ) {}

    public function index(Request $request, Course $course): JsonResponse
    {
        $this->authorize('manageCurriculum', $course);

        return ApiResponse::success(
            AssignmentResource::collection($this->assignments->forCourse($course))
        );
    }

    public function show(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('view', $assignment->lesson);

        $student = $this->optionalUser($request);

        if ($student !== null) {

            $assignment->setRelation('mySubmission', $this->submissions->findFor($assignment, $student));
        }

        return ApiResponse::success(new AssignmentResource($assignment));
    }

    /**
     * A lesson holds at most one assignment, so this creates or replaces it.
     */
    public function upsert(StoreAssignmentRequest $request, Lesson $lesson): JsonResponse
    {
        $existing = $this->assignments->findForLesson($lesson);
        $data = $request->validated();

        $assignment = $existing !== null
            ? $this->assignments->update($existing, $data)
            : $this->assignments->create([...$data, 'lesson_id' => $lesson->id]);

        return ApiResponse::success(new AssignmentResource($assignment), 'Assignment saved.');
    }

    public function destroy(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('manageCurriculum', $assignment->lesson->course);

        $this->assignments->delete($assignment);

        return ApiResponse::success(null, 'Assignment deleted.');
    }
}
