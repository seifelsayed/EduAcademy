<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Assessment\UseCases\StartQuizAttempt;
use App\Application\Assessment\UseCases\SubmitQuizAttempt;
use App\Domain\Assessment\Contracts\QuizAttemptRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Assessment\SubmitQuizRequest;
use App\Presentation\Http\Resources\QuizAttemptResource;
use App\Presentation\Http\Resources\QuizResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Taking a quiz, from the learner's side.
 */
final class QuizAttemptController extends Controller
{
    public function __construct(
        private readonly QuizAttemptRepositoryInterface $attempts,
    ) {}

    /**
     * Starts (or resumes) an attempt and returns the questions — with the
     * correct answers stripped out.
     */
    public function start(Request $request, Quiz $quiz, StartQuizAttempt $useCase): JsonResponse
    {
        $student = $this->user($request);
        $result = $useCase->execute($student, $quiz);

        $result['quiz']->questions->each(static fn (Question $q) => $q->reveal_answers = false);

        return ApiResponse::success([
            'attempt' => new QuizAttemptResource($result['attempt']),
            'quiz' => new QuizResource($result['quiz']),
        ]);
    }

    public function submit(SubmitQuizRequest $request, QuizAttempt $attempt, SubmitQuizAttempt $useCase): JsonResponse
    {
        $outcome = $useCase->execute(
            $this->user($request),
            $attempt,
            $request->responses(),
        );

        return ApiResponse::success([
            'attempt' => new QuizAttemptResource($outcome['attempt']),
            'result' => $outcome['result'],
        ], $outcome['result']['passed'] ? 'Passed — nice work.' : 'Attempt submitted.');
    }

    public function show(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $student = $this->user($request);

        if ($attempt->user_id !== $student->id && ! $student->isAdmin()) {
            throw BusinessRuleViolation::forbidden('This attempt belongs to someone else.', 'attempt_owner_mismatch');
        }

        return ApiResponse::success(
            new QuizAttemptResource($attempt->load(['answers', 'quiz.questions.options']))
        );
    }

    /**
     * Attempt history for one quiz.
     */
    public function history(Request $request, Quiz $quiz): JsonResponse
    {
        $student = $this->user($request);

        return ApiResponse::success(
            QuizAttemptResource::collection($this->attempts->historyFor($quiz, $student)),
            null,
            200,
            [
                'used_attempts' => $this->attempts->countFor($quiz, $student),
                'max_attempts' => $quiz->max_attempts,
                'best_score' => $this->attempts->bestScore($quiz, $student),
            ],
        );
    }
}
