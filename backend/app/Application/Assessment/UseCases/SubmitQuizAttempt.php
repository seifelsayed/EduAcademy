<?php

declare(strict_types=1);

namespace App\Application\Assessment\UseCases;

use App\Application\Learning\UseCases\TrackLessonProgress;
use App\Domain\Assessment\Contracts\QuizAttemptRepositoryInterface;
use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Domain\Assessment\Enums\AttemptStatus;
use App\Domain\Assessment\Services\QuizGrader;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Contracts\TransactionManager;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class SubmitQuizAttempt
{
    public function __construct(
        private QuizAttemptRepositoryInterface $attempts,
        private QuizRepositoryInterface $quizzes,
        private EnrollmentRepositoryInterface $enrollments,
        private QuizGrader $grader,
        private TrackLessonProgress $progress,
        private TransactionManager $transaction,
    ) {}

    /**
     * @param  array<int, array{question_id: int, option_ids?: array<int, int>, text?: string|null}>  $responses
     * @return array{attempt: QuizAttempt, result: array<string, mixed>}
     */
    public function execute(User $student, QuizAttempt $attempt, array $responses): array
    {
        if ($attempt->user_id !== $student->id) {
            throw BusinessRuleViolation::forbidden('This attempt belongs to someone else.', 'attempt_owner_mismatch');
        }

        if ($attempt->status->isFinal()) {
            throw BusinessRuleViolation::conflict(
                'This attempt has already been submitted.',
                'attempt_already_submitted',
            );
        }

        $quiz = $this->quizzes->findWithQuestions($attempt->quiz_id);

        if ($quiz === null) {
            throw BusinessRuleViolation::notFound('The quiz no longer exists.', 'quiz_not_found');
        }

        // A late submission is still graded — the learner simply loses whatever
        // they had not answered when time ran out.
        $questions = $quiz->questions->map(fn ($question): array => $question->toGradingArray())->all();
        $result = $this->grader->grade($questions, $responses);
        $passed = $this->grader->hasPassed($result['score'], $quiz->passing_score);

        return $this->transaction->run(function () use ($student, $attempt, $quiz, $responses, $result, $passed): array {
            $updated = $this->attempts->update($attempt, [
                'status' => AttemptStatus::Submitted->value,
                'score' => $result['score'],
                'earned_points' => $result['earned_points'],
                'total_points' => $result['total_points'],
                'correct_count' => $result['correct_count'],
                'question_count' => $result['question_count'],
                'passed' => $passed,
                'submitted_at' => now(),
            ]);

            $this->attempts->recordAnswers($updated, $this->buildAnswerRows($responses, $result['breakdown']));

            // Passing the quiz completes the lesson it belongs to.
            if ($passed) {
                $enrollment = $this->enrollments->findFor($student, $quiz->lesson->course);

                if ($enrollment !== null && $enrollment->grantsAccess()) {
                    $this->progress->complete($enrollment, $quiz->lesson);
                }
            }

            return [
                'attempt' => $updated->load('answers'),
                'result' => [
                    ...$result,
                    'passed' => $passed,
                    'passing_score' => $quiz->passing_score,
                    'show_correct_answers' => $quiz->show_correct_answers,
                ],
            ];
        });
    }

    /**
     * Merges the learner's raw responses with the grader's verdict per question.
     *
     * @param  array<int, array{question_id: int, option_ids?: array<int, int>, text?: string|null}>  $responses
     * @param  array<int, array{question_id: int, is_correct: bool, earned_points: int, points: int}>  $breakdown
     * @return array<int, array<string, mixed>>
     */
    private function buildAnswerRows(array $responses, array $breakdown): array
    {
        $verdicts = [];
        foreach ($breakdown as $entry) {
            $verdicts[$entry['question_id']] = $entry;
        }

        $rows = [];
        foreach ($responses as $response) {
            $questionId = (int) $response['question_id'];
            $verdict = $verdicts[$questionId] ?? null;

            $rows[] = [
                'question_id' => $questionId,
                'selected_option_ids' => $response['option_ids'] ?? null,
                'text_answer' => $response['text'] ?? null,
                'is_correct' => (bool) ($verdict['is_correct'] ?? false),
                'earned_points' => (int) ($verdict['earned_points'] ?? 0),
            ];
        }

        return $rows;
    }
}
