<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers\Api\V1;

use App\Application\Assessment\UseCases\ManageQuiz;
use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Presentation\Http\Controllers\Controller;
use App\Presentation\Http\Requests\Assessment\StoreQuestionRequest;
use App\Presentation\Http\Requests\Assessment\StoreQuizRequest;
use App\Presentation\Http\Resources\QuestionResource;
use App\Presentation\Http\Resources\QuizResource;
use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Quiz authoring. Taking a quiz lives in QuizAttemptController.
 */
final class QuizController extends Controller
{
    public function __construct(
        private readonly ManageQuiz $quizzes,
        private readonly QuizRepositoryInterface $repository,
    ) {}

    public function show(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('manageCurriculum', $quiz->lesson->course);

        $loaded = $this->repository->findWithQuestions($quiz->id) ?? $quiz;

        // The author sees the answer key.
        $loaded->questions->each(static fn (Question $q) => $q->reveal_answers = true);

        return ApiResponse::success(new QuizResource($loaded));
    }

    public function upsert(StoreQuizRequest $request, Lesson $lesson): JsonResponse
    {
        $quiz = $this->quizzes->upsert($lesson, $request->validated());

        return ApiResponse::success(new QuizResource($quiz->load('questions.options')), 'Quiz saved.');
    }

    public function destroy(Request $request, Quiz $quiz): JsonResponse
    {
        $this->authorize('manageCurriculum', $quiz->lesson->course);

        $this->quizzes->delete($quiz);

        return ApiResponse::success(null, 'Quiz deleted.');
    }

    public function storeQuestion(StoreQuestionRequest $request, Quiz $quiz): JsonResponse
    {
        $question = $this->quizzes->addQuestion($quiz, $request->validated());
        $question->reveal_answers = true;

        return ApiResponse::created(new QuestionResource($question), 'Question added.');
    }

    public function updateQuestion(StoreQuestionRequest $request, Question $question): JsonResponse
    {
        $updated = $this->quizzes->updateQuestion($question, $request->validated());
        $updated->reveal_answers = true;

        return ApiResponse::success(new QuestionResource($updated), 'Question updated.');
    }

    public function destroyQuestion(Request $request, Question $question): JsonResponse
    {
        $this->authorize('manageCurriculum', $question->quiz->lesson->course);

        $this->quizzes->deleteQuestion($question);

        return ApiResponse::success(null, 'Question deleted.');
    }
}
