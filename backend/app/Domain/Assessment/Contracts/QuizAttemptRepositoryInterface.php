<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<QuizAttempt>
 */
interface QuizAttemptRepositoryInterface extends Repository
{
    public function findInProgress(Quiz $quiz, User $student): ?QuizAttempt;

    public function countFor(Quiz $quiz, User $student): int;

    public function bestScore(Quiz $quiz, User $student): ?float;

    /**
     * @return Collection<int, QuizAttempt>
     */
    public function historyFor(Quiz $quiz, User $student): Collection;

    /**
     * Stores the answers of a submitted attempt.
     *
     * @param  array<int, array<string, mixed>>  $answers
     */
    public function recordAnswers(QuizAttempt $attempt, array $answers): void;

    /**
     * Best score per quiz for a student, keyed by quiz id.
     *
     * @param  array<int, int>  $quizIds
     * @return array<int, float>
     */
    public function bestScoresForQuizzes(array $quizIds, User $student): array;
}
