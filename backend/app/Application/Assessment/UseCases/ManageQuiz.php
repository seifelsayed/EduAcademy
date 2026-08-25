<?php

declare(strict_types=1);

namespace App\Application\Assessment\UseCases;

use App\Domain\Assessment\Contracts\QuizRepositoryInterface;
use App\Domain\Assessment\Enums\QuestionType;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Infrastructure\Persistence\Eloquent\Models\Lesson;
use App\Infrastructure\Persistence\Eloquent\Models\Question;
use App\Infrastructure\Persistence\Eloquent\Models\Quiz;

final readonly class ManageQuiz
{
    public function __construct(
        private QuizRepositoryInterface $quizzes,
    ) {}

    /**
     * A lesson holds at most one quiz, so this creates or updates in place.
     *
     * @param  array<string, mixed>  $data
     */
    public function upsert(Lesson $lesson, array $data): Quiz
    {
        $attributes = [
            'title' => $data['title'] ?? $lesson->title,
            'description' => $data['description'] ?? null,
            'time_limit_minutes' => $data['time_limit_minutes'] ?? null,
            'passing_score' => (int) ($data['passing_score'] ?? config('platform.quiz_pass_threshold', 60)),
            'max_attempts' => $data['max_attempts'] ?? null,
            'shuffle_questions' => (bool) ($data['shuffle_questions'] ?? false),
            'show_correct_answers' => (bool) ($data['show_correct_answers'] ?? true),
        ];

        $existing = $this->quizzes->findForLesson($lesson);

        if ($existing !== null) {
            return $this->quizzes->update($existing, $attributes);
        }

        return $this->quizzes->create([...$attributes, 'lesson_id' => $lesson->id]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addQuestion(Quiz $quiz, array $data): Question
    {
        $type = QuestionType::from((string) $data['type']);
        $options = $this->normaliseOptions($type, $data);

        return $this->quizzes->addQuestion($quiz, [
            'type' => $type->value,
            'prompt' => $data['prompt'],
            'explanation' => $data['explanation'] ?? null,
            'answer_key' => $type->isOptionBased() ? null : ($data['answer_key'] ?? null),
            'points' => max(1, (int) ($data['points'] ?? 1)),
            'position' => $this->quizzes->nextQuestionPosition($quiz),
        ], $options);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateQuestion(Question $question, array $data): Question
    {
        $type = QuestionType::from((string) ($data['type'] ?? $question->type->value));
        $options = $this->normaliseOptions($type, $data);

        return $this->quizzes->updateQuestion($question, [
            'type' => $type->value,
            'prompt' => $data['prompt'] ?? $question->prompt,
            'explanation' => $data['explanation'] ?? null,
            'answer_key' => $type->isOptionBased() ? null : ($data['answer_key'] ?? null),
            'points' => max(1, (int) ($data['points'] ?? $question->points)),
        ], $options);
    }

    public function deleteQuestion(Question $question): void
    {
        $this->quizzes->deleteQuestion($question);
    }

    public function delete(Quiz $quiz): void
    {
        $this->quizzes->delete($quiz);
    }

    /**
     * Validates the option set against the question type and returns it in the
     * shape the repository expects.
     *
     * @param  array<string, mixed>  $data
     * @return array<int, array<string, mixed>>
     */
    private function normaliseOptions(QuestionType $type, array $data): array
    {
        if (! $type->isOptionBased()) {
            if (blank($data['answer_key'] ?? null)) {
                throw new BusinessRuleViolation(
                    'A short-answer question needs an answer key.',
                    'answer_key_required',
                    422,
                    ['field' => 'answer_key'],
                );
            }

            return [];
        }

        $options = array_values((array) ($data['options'] ?? []));

        if (count($options) < 2) {
            throw new BusinessRuleViolation(
                'A choice question needs at least two options.',
                'insufficient_options',
                422,
                ['field' => 'options'],
            );
        }

        $correct = array_filter($options, static fn (array $o): bool => (bool) ($o['is_correct'] ?? false));

        if ($correct === []) {
            throw new BusinessRuleViolation(
                'Mark at least one option as correct.',
                'no_correct_option',
                422,
                ['field' => 'options'],
            );
        }

        if (! $type->allowsMultipleSelections() && count($correct) > 1) {
            throw new BusinessRuleViolation(
                'This question type allows only one correct option.',
                'too_many_correct_options',
                422,
                ['field' => 'options'],
            );
        }

        if ($type === QuestionType::TrueFalse && count($options) !== 2) {
            throw new BusinessRuleViolation(
                'A true/false question must have exactly two options.',
                'invalid_true_false_options',
                422,
                ['field' => 'options'],
            );
        }

        return $options;
    }
}
