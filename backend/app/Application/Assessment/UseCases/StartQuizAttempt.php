<?php

declare(strict_types=1);

namespace App\Application\Assessment\UseCases;

use App\Domain\Assessment\Contracts\QuizAttemptRepositoryInterface;
use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Domain\Assessment\Enums\AttemptStatus;
use App\Domain\Learning\Contracts\EnrollmentRepositoryInterface;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class StartQuizAttempt
{
    public function __construct(
        private QuizAttemptRepositoryInterface $attempts,
        private QuizRepositoryInterface $quizzes,
        private EnrollmentRepositoryInterface $enrollments,
    ) {}

    /**
     * @return array{attempt: QuizAttempt, quiz: Quiz}
     */
    public function execute(User $student, Quiz $quiz): array
    {
        $course = $quiz->lesson->course;

        $enrollment = $this->enrollments->findFor($student, $course);

        if ($enrollment === null || ! $enrollment->grantsAccess()) {
            throw BusinessRuleViolation::forbidden(
                'Enrol in this course to take the quiz.',
                'not_enrolled',
            );
        }

        // Resuming beats starting over: an interrupted attempt is still open.
        $open = $this->attempts->findInProgress($quiz, $student);

        if ($open !== null && $open->isOpen()) {
            return ['attempt' => $open, 'quiz' => $this->loadQuestions($quiz)];
        }

        if ($open !== null) {
            // The clock ran out while the learner was away.
            $this->attempts->update($open, ['status' => AttemptStatus::Abandoned->value]);
        }

        $used = $this->attempts->countFor($quiz, $student);

        if (! $quiz->hasAttemptsRemaining($used)) {
            throw BusinessRuleViolation::forbidden(
                'You have used all your attempts for this quiz.',
                'no_attempts_remaining',
                ['max_attempts' => $quiz->max_attempts, 'used_attempts' => $used],
            );
        }

        $loaded = $this->loadQuestions($quiz);

        if ($loaded->questions->isEmpty()) {
            throw new BusinessRuleViolation(
                'This quiz has no questions yet.',
                'quiz_empty',
            );
        }

        $attempt = $this->attempts->create([
            'quiz_id' => $quiz->id,
            'user_id' => $student->id,
            'status' => AttemptStatus::InProgress->value,
            'attempt_number' => $used + 1,
            'question_count' => $loaded->questions->count(),
            'total_points' => $this->quizzes->totalPoints($quiz),
            'started_at' => now(),
            'expires_at' => $quiz->isTimed() ? now()->addMinutes((int) $quiz->time_limit_minutes) : null,
        ]);

        return ['attempt' => $attempt, 'quiz' => $loaded];
    }

    private function loadQuestions(Quiz $quiz): Quiz
    {
        $loaded = $this->quizzes->findWithQuestions($quiz->id) ?? $quiz;

        if ($loaded->shuffle_questions) {
            $loaded->setRelation('questions', $loaded->questions->shuffle()->values());
        }

        return $loaded;
    }
}
