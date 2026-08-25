<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends Repository<Quiz>
 */
interface QuizRepositoryInterface extends Repository
{
    public function findForLesson(Lesson $lesson): ?Quiz;

    /**
     * Quiz with questions and options eager-loaded, ordered by position.
     */
    public function findWithQuestions(int $id): ?Quiz;

    /**
     * @return Collection<int, Question>
     */
    public function questionsFor(Quiz $quiz): Collection;

    public function totalPoints(Quiz $quiz): int;

    public function nextQuestionPosition(Quiz $quiz): int;

    /**
     * Creates a question together with its options in one unit of work.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<int, array<string, mixed>>  $options
     */
    public function addQuestion(Quiz $quiz, array $attributes, array $options): Question;

    /**
     * Replaces a question and its full option set.
     *
     * @param  array<string, mixed>  $attributes
     * @param  array<int, array<string, mixed>>  $options
     */
    public function updateQuestion(Question $question, array $attributes, array $options): Question;

    public function deleteQuestion(Question $question): void;
}
