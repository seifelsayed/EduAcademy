<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Catalog\UseCases\ManageCategories;
use App\Infrastructure\Persistence\Eloquent\Models\Category;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Catalog\StoreCategoryRequest;
use App\Presentation\Http\Resources\CategoryResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CategoryController extends Controller
{
    public function __construct(
        private readonly ManageCategories $categories,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categories = $request->boolean('with_counts')
            ? $this->categories->withCounts()
            : $this->categories->tree();

        return ApiResponse::success(CategoryResource::collection($categories));
    }

    public function show(Category $category): JsonResponse
    {
        return ApiResponse::success(new CategoryResource($category->load('children')));
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categories->create($request->validated());

        return ApiResponse::created(new CategoryResource($category), 'Category created.');
    }

    public function update(StoreCategoryRequest $request, Category $category): JsonResponse
    {
        $updated = $this->categories->update($category, $request->validated());

        return ApiResponse::success(new CategoryResource($updated), 'Category updated.');
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->authorize('access-admin');

        $this->categories->delete($category);

        return ApiResponse::success(null, 'Category deleted.');
    }
}
