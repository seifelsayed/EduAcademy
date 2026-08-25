<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Engagement\UseCases\SubmitReview;
use App\Domain\Engagement\Contracts\ReviewRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Review;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Engagement\StoreReviewRequest;
use App\Presentation\Http\Resources\ReviewResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ReviewController extends Controller
{
    public function __construct(
        private readonly ReviewRepositoryInterface $reviews,
        private readonly SubmitReview $submitReview,
    ) {}

    public function index(Request $request, Course $course): JsonResponse
    {
        $rating = $request->filled('rating') ? $request->integer('rating') : null;

        $paginator = $this->reviews->paginateForCourse($course, $rating, $this->perPage($request));

        return ApiResponse::paginated($paginator, ReviewResource::class, [
            'average' => $this->reviews->averageRating($course),
            'total' => $this->reviews->countForCourse($course),
            'breakdown' => $this->reviews->ratingBreakdown($course),
        ]);
    }

    public function store(StoreReviewRequest $request, Course $course): JsonResponse
    {
        $review = $this->submitReview->execute($this->user($request), $course, $request->validated());

        return ApiResponse::success(new ReviewResource($review), 'Thanks for your review.');
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $this->authorize('delete', $review);

        $this->submitReview->delete($review);

        return ApiResponse::success(null, 'Review removed.');
    }

    public function reply(Request $request, Review $review): JsonResponse
    {
        $this->authorize('reply', $review);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $updated = $this->submitReview->reply($this->user($request), $review, $validated['body']);

        return ApiResponse::success(new ReviewResource($updated), 'Reply posted.');
    }
}
