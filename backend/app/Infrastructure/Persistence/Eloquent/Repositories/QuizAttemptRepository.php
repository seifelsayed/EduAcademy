<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Assessment\Contracts\QuizAttemptRepositoryInterface;
use App\Domain\Assessment\Enums\AttemptStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<QuizAttempt>
 */
final class QuizAttemptRepository extends BaseRepository implements QuizAttemptRepositoryInterface
{
    protected function model(): string
    {
        return QuizAttempt::class;
    }

    public function findInProgress(Quiz $quiz, User $student): ?QuizAttempt
    {
        return $this->query()
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $student->id)
            ->where('status', AttemptStatus::InProgress->value)
            ->latest('started_at')
            ->first();
    }

    public function countFor(Quiz $quiz, User $student): int
    {
        return $this->query()
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $student->id)
            ->where('status', '!=', AttemptStatus::Abandoned->value)
            ->count();
    }

    public function bestScore(Quiz $quiz, User $student): ?float
    {
        $best = $this->query()
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $student->id)
            ->where('status', AttemptStatus::Submitted->value)
            ->max('score');

        return $best === null ? null : (float) $best;
    }

    public function historyFor(Quiz $quiz, User $student): Collection
    {
        return $this->query()
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $student->id)
            ->orderByDesc('started_at')
            ->get();
    }

    public function recordAnswers(QuizAttempt $attempt, array $answers): void
    {
        DB::transaction(function () use ($attempt, $answers): void {
            $attempt->answers()->delete();

            foreach ($answers as $answer) {
                $attempt->answers()->create([
                    'question_id' => $answer['question_id'],
                    'selected_option_ids' => $answer['selected_option_ids'] ?? null,
                    'text_answer' => $answer['text_answer'] ?? null,
                    'is_correct' => (bool) ($answer['is_correct'] ?? false),
                    'earned_points' => (int) ($answer['earned_points'] ?? 0),
                ]);
            }
        });
    }

    public function bestScoresForQuizzes(array $quizIds, User $student): array
    {
        if ($quizIds === []) {
            return [];
        }

        return $this->query()
            ->whereIn('quiz_id', $quizIds)
            ->where('user_id', $student->id)
            ->where('status', AttemptStatus::Submitted->value)
            ->select('quiz_id', DB::raw('MAX(score) as best_score'))
            ->groupBy('quiz_id')
            ->pluck('best_score', 'quiz_id')
            ->map(static fn ($score): float => (float) $score)
            ->all();
    }
}
