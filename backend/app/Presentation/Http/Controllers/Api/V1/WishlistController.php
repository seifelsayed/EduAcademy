<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Engagement\UseCases\ToggleWishlist;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Resources\CourseResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class WishlistController extends Controller
{
    public function __construct(
        private readonly ToggleWishlist $wishlist,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $courses = $this->wishlist->list($this->user($request))
            ->pluck('course')
            ->filter()
            ->values();

        $courses->each(static fn (Course $course) => $course->is_wishlisted = true);

        return ApiResponse::success(CourseResource::collection($courses));
    }

    public function toggle(Request $request, Course $course): JsonResponse
    {
        $result = $this->wishlist->execute($this->user($request), $course);

        return ApiResponse::success(
            $result,
            $result['wishlisted'] ? 'Added to your wishlist.' : 'Removed from your wishlist.',
        );
    }
}
