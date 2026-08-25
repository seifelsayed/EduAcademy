<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Catalog\DTOs\CourseData;
use App\Application\Catalog\UseCases\CreateCourse;
use App\Application\Catalog\UseCases\DeleteCourse;
use App\Application\Catalog\UseCases\ListCourses;
use App\Application\Catalog\UseCases\PublishCourse;
use App\Application\Catalog\UseCases\UpdateCourse;
use App\Application\Engagement\UseCases\ToggleWishlist;
use App\Domain\Catalog\Contracts\CourseRepositoryInterface;
use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Catalog\StoreCourseRequest;
use App\Presentation\Http\Requests\Catalog\UpdateCourseRequest;
use App\Presentation\Http\Resources\CourseDetailResource;
use App\Presentation\Http\Resources\CourseResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CourseController extends Controller
{
    public function __construct(
        private readonly CourseRepositoryInterface $courses,
        private readonly EnrollmentRepositoryInterface $enrollments,
        private readonly ReviewRepositoryInterface $reviews,
        private readonly ListCourses $listCourses,
        private readonly ToggleWishlist $wishlist,
    ) {}

    /**
     * Public catalogue.
     */
    public function index(Request $request): JsonResponse
    {
        $paginator = $this->listCourses->execute($request->query());
        $user = $this->optionalUser($request);

        $this->decorateForViewer($user, $paginator->getCollection());

        return ApiResponse::paginated($paginator, CourseResource::class);
    }

    public function featured(): JsonResponse
    {
        return ApiResponse::success(
            CourseResource::collection($this->courses->featured(8))
        );
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $course = $this->courses->findBySlug($slug);

        if ($course === null) {
            return ApiResponse::error('Course not found.', 'not_found', 404);
        }

        $user = $this->optionalUser($request);

        // Drafts stay private to instructors/author and admins.
        $this->authorizeForUser($user, 'view', $course);

        $full = $this->courses->findWithCurriculum($course->id) ?? $course;

        $this->markLessonAccess($user, $full);
        $this->decorateForViewer($user, collect([$full]));

        return ApiResponse::success(new CourseDetailResource($full), null, 200, [
            'rating_breakdown' => $this->reviews->ratingBreakdown($full),
            'related' => CourseResource::collection($this->courses->related($full, 4))->resolve(),
        ]);
    }


    /**
     * Courses owned by the signed-in instructor, drafts included.
     */
    public function mine(Request $request): JsonResponse
    {
        $this->authorize('access-instructor');

        $paginator = $this->listCourses->forInstructor(
            $this->user($request)->id,
            $request->query(),
        );

        return ApiResponse::paginated($paginator, CourseResource::class);
    }

    public function store(StoreCourseRequest $request, CreateCourse $useCase): JsonResponse
    {
        $course = $useCase->execute(
            $this->user($request),
            CourseData::fromArray($request->safe()->except('thumbnail'), $request->file('thumbnail')),
        );

        return ApiResponse::created(new CourseDetailResource($course), 'Course created.');
    }

    public function update(UpdateCourseRequest $request, Course $course, UpdateCourse $useCase): JsonResponse
    {
        $updated = $useCase->execute(
            $course,
            CourseData::fromArray($request->safe()->except('thumbnail'), $request->file('thumbnail')),
        );

        return ApiResponse::success(new CourseDetailResource($updated), 'Course updated.');
    }

    public function destroy(Request $request, Course $course, DeleteCourse $useCase): JsonResponse
    {
        $this->authorize('delete', $course);

        $useCase->execute($course, force: $this->user($request)->isAdmin() && $request->boolean('force'));

        return ApiResponse::success(null, 'Course deleted.');
    }

    public function publish(Request $request, Course $course, PublishCourse $useCase): JsonResponse
    {
        $this->authorize('publish', $course);

        return ApiResponse::success(
            new CourseDetailResource($useCase->execute($course)),
            'Course published.',
        );
    }

    public function unpublish(Request $request, Course $course, PublishCourse $useCase): JsonResponse
    {
        $this->authorize('publish', $course);

        return ApiResponse::success(
            new CourseDetailResource($useCase->unpublish($course)),
            'Course moved back to draft.',
        );
    }

    public function archive(Request $request, Course $course, PublishCourse $useCase): JsonResponse
    {
        $this->authorize('publish', $course);

        return ApiResponse::success(
            new CourseDetailResource($useCase->archive($course)),
            'Course archived.',
        );
    }

    /**
     * Pre-publish checklist for the course editor.
     */
    public function readiness(Request $request, Course $course, PublishCourse $useCase): JsonResponse
    {
        $this->authorize('update', $course);

        $problems = $useCase->readinessProblems($course);

        return ApiResponse::success([
            'is_ready' => $problems === [],
            'problems' => $problems,
        ]);
    }

    /**
     * Adds the viewer-specific flags the catalogue cards render.
     *
     * @param  \Illuminate\Support\Collection<int, Course>  $courses
     */
    private function decorateForViewer(?User $viewer, $courses): void
    {
        if ($viewer === null || $courses->isEmpty()) {
            return;
        }

        $courseIds = $courses->pluck('id')->map(static fn ($id): int => (int) $id)->all();

        $enrolledIds = $viewer->enrollments()
            ->whereIn('course_id', $courseIds)
            ->pluck('course_id')
            ->map(static fn ($id): int => (int) $id)
            ->all();

        $wishlistedIds = $this->wishlist->filterWishlisted($viewer, $courseIds);

        foreach ($courses as $course) {
            $course->is_enrolled = in_array((int) $course->id, $enrolledIds, true);
            $course->is_wishlisted = in_array((int) $course->id, $wishlistedIds, true);
        }
    }

    /**
     * Flags which lessons the viewer may actually open, so the resource can
     * withhold locked content without each lesson re-running the check.
     */
    private function markLessonAccess(?User $viewer, Course $course): void
    {
        $hasFullAccess = $viewer !== null
            && ($viewer->isAdmin()
                || $course->isOwnedBy($viewer)
                || $this->enrollments->findFor($viewer, $course)?->grantsAccess() === true);

        foreach ($course->sections as $section) {
            foreach ($section->lessons as $lesson) {
                $lesson->has_access = $hasFullAccess || $lesson->isFreelyViewable();
            }
        }
    }
}
