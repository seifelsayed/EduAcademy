<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Catalog\UseCases\ManageSections;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Section;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Catalog\ReorderRequest;
use App\Presentation\Http\Requests\Catalog\StoreSectionRequest;
use App\Presentation\Http\Resources\SectionResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SectionController extends Controller
{
    public function __construct(
        private readonly ManageSections $sections,
    ) {}

    public function index(Request $request, Course $course): JsonResponse
    {
        $this->authorize('view', $course);

        return ApiResponse::success(
            SectionResource::collection($course->sections()->with('lessons')->get())
        );
    }

    public function store(StoreSectionRequest $request, Course $course): JsonResponse
    {
        $section = $this->sections->create($course, $request->validated());

        return ApiResponse::created(new SectionResource($section), 'Section added.');
    }

    public function update(StoreSectionRequest $request, Section $section): JsonResponse
    {
        return ApiResponse::success(
            new SectionResource($this->sections->update($section, $request->validated())),
            'Section updated.',
        );
    }

    public function destroy(Request $request, Section $section): JsonResponse
    {
        $this->authorize('manageCurriculum', $section->course);

        $this->sections->delete($section);

        return ApiResponse::success(null, 'Section deleted.');
    }

    public function reorder(ReorderRequest $request, Course $course): JsonResponse
    {
        $this->sections->reorder($course, $request->orderedIds());

        return ApiResponse::success(
            SectionResource::collection($course->sections()->with('lessons')->get()),
            'Sections reordered.',
        );
    }
}
