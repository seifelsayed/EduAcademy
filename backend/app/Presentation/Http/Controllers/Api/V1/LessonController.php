<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Catalog\UseCases\ManageLessons;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Catalog\ReorderRequest;
use App\Presentation\Http\Requests\Catalog\StoreLessonRequest;
use App\Presentation\Http\Resources\LessonResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class LessonController extends Controller
{
    public function __construct(
        private readonly ManageLessons $lessons,
    ) {}

    public function show(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('view', $lesson);

        $lesson->has_access = true;

        return ApiResponse::success(
            new LessonResource($lesson->load(['quiz', 'assignment']))
        );
    }

    public function store(StoreLessonRequest $request, Section $section): JsonResponse
    {
        $lesson = $this->lessons->create($section, $request->validated());

        $lesson->has_access = true;

        return ApiResponse::created(new LessonResource($lesson), 'Lesson added.');
    }

    public function update(StoreLessonRequest $request, Lesson $lesson): JsonResponse
    {
        $updated = $this->lessons->update($lesson, $request->validated());

        $updated->has_access = true;

        return ApiResponse::success(new LessonResource($updated), 'Lesson updated.');
    }

    public function destroy(Request $request, Lesson $lesson): JsonResponse
    {
        $this->authorize('delete', $lesson);

        $this->lessons->delete($lesson);

        return ApiResponse::success(null, 'Lesson deleted.');
    }

    public function reorder(ReorderRequest $request, Section $section): JsonResponse
    {
        $this->lessons->reorder($section, $request->orderedIds());

        return ApiResponse::success(
            LessonResource::collection($section->lessons()->get()),
            'Lessons reordered.',
        );
    }
}
