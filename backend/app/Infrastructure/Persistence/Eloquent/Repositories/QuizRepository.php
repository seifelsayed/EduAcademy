<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Quiz>
 */
final class QuizRepository extends BaseRepository implements QuizRepositoryInterface
{
    protected function model(): string
    {
        return Quiz::class;
    }

    public function findForLesson(Lesson $lesson): ?Quiz
    {
        return $this->query()->where('lesson_id', $lesson->id)->first();
    }

    public function findWithQuestions(int $id): ?Quiz
    {
        return $this->query()
            ->with(['questions.options'])
            ->find($id);
    }

    public function questionsFor(Quiz $quiz): Collection
    {
        return $quiz->questions()->with('options')->get();
    }

    public function totalPoints(Quiz $quiz): int
    {
        return (int) $quiz->questions()->sum('points');
    }

    public function nextQuestionPosition(Quiz $quiz): int
    {
        return (int) $quiz->questions()->max('position') + 1;
    }

    public function addQuestion(Quiz $quiz, array $attributes, array $options): Question
    {
        return DB::transaction(function () use ($quiz, $attributes, $options): Question {
            /** @var Question $question */
            $question = $quiz->questions()->create($attributes);

            $this->syncOptions($question, $options);

            return $question->load('options');
        });
    }

    public function updateQuestion(Question $question, array $attributes, array $options): Question
    {
        return DB::transaction(function () use ($question, $attributes, $options): Question {
            $question->fill($attributes)->save();

            // Options are replaced wholesale — editing a question is rare and
            // diffing option rows adds complexity with no real payoff.
            $question->options()->delete();
            $this->syncOptions($question, $options);

            return $question->refresh()->load('options');
        });
    }

    public function deleteQuestion(Question $question): void
    {
        $question->delete();
    }

    /**
     * @param  array<int, array<string, mixed>>  $options
     */
    private function syncOptions(Question $question, array $options): void
    {
        foreach (array_values($options) as $index => $option) {
            $question->options()->create([
                'text' => $option['text'],
                'is_correct' => (bool) ($option['is_correct'] ?? false),
                'position' => $index + 1,
            ]);
        }
    }
}
