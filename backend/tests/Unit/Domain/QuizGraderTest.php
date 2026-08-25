<?php

declare(strict_types=1);

namespace Tests\Unit\Domain;

use App\Domain\Assessment\Enums\QuestionType;
use App\Domain\Assessment\Services\QuizGrader;
use PHPUnit\Framework\TestCase;

/**
 * The grader is pure logic, so these run without booting Laravel.
 */
final class QuizGraderTest extends TestCase
{
    private QuizGrader $grader;

    protected function setUp(): void
    {
        parent::setUp();

        $this->grader = new QuizGrader;
    }

    public function test_it_scores_a_perfect_single_choice_run(): void
    {
        $result = $this->grader->grade(
            [$this->question(1, QuestionType::SingleChoice, [10])],
            [['question_id' => 1, 'option_ids' => [10]]],
        );

        $this->assertSame(100.0, $result['score']);
        $this->assertSame(1, $result['correct_count']);
        $this->assertSame(1, $result['earned_points']);
    }

    public function test_multiple_choice_requires_every_correct_option(): void
    {
        $question = $this->question(1, QuestionType::MultipleChoice, [10, 11], points: 2);

        $partial = $this->grader->grade([$question], [['question_id' => 1, 'option_ids' => [10]]]);
        $complete = $this->grader->grade([$question], [['question_id' => 1, 'option_ids' => [11, 10]]]);

        $this->assertSame(0.0, $partial['score'], 'Partial selections earn nothing.');
        $this->assertSame(100.0, $complete['score'], 'Option order must not matter.');
    }

    public function test_unanswered_questions_score_zero_without_erroring(): void
    {
        $result = $this->grader->grade(
            [
                $this->question(1, QuestionType::SingleChoice, [10]),
                $this->question(2, QuestionType::SingleChoice, [20]),
            ],
            [['question_id' => 1, 'option_ids' => [10]]],
        );

        $this->assertSame(50.0, $result['score']);
        $this->assertSame(2, $result['question_count']);
    }

    public function test_short_answers_ignore_case_whitespace_and_accept_alternatives(): void
    {
        $question = [
            'id' => 1,
            'type' => QuestionType::ShortAnswer->value,
            'points' => 1,
            'correct_option_ids' => [],
            'answer_key' => 'Dependency Injection|DI',
        ];

        foreach (['dependency injection', '  Dependency   Injection  ', 'di'] as $answer) {
            $result = $this->grader->grade([$question], [['question_id' => 1, 'text' => $answer]]);

            $this->assertSame(100.0, $result['score'], "Expected '{$answer}' to be accepted.");
        }

        $wrong = $this->grader->grade([$question], [['question_id' => 1, 'text' => 'inversion of control']]);
        $this->assertSame(0.0, $wrong['score']);
    }

    public function test_weighted_questions_contribute_proportionally(): void
    {
        $result = $this->grader->grade(
            [
                $this->question(1, QuestionType::SingleChoice, [10], points: 3),
                $this->question(2, QuestionType::SingleChoice, [20], points: 1),
            ],
            [
                ['question_id' => 1, 'option_ids' => [10]],
                ['question_id' => 2, 'option_ids' => [21]],
            ],
        );

        $this->assertSame(75.0, $result['score']);
        $this->assertSame(3, $result['earned_points']);
        $this->assertSame(4, $result['total_points']);
    }

    public function test_an_empty_quiz_scores_zero_rather_than_dividing_by_zero(): void
    {
        $result = $this->grader->grade([], []);

        $this->assertSame(0.0, $result['score']);
    }

    public function test_pass_threshold_is_inclusive(): void
    {
        $this->assertTrue($this->grader->hasPassed(60.0, 60));
        $this->assertFalse($this->grader->hasPassed(59.99, 60));
    }

    /**
     * @param  array<int, int>  $correctOptionIds
     * @return array{id: int, type: string, points: int, correct_option_ids: array<int, int>, answer_key: string|null}
     */
    private function question(int $id, QuestionType $type, array $correctOptionIds, int $points = 1): array
    {
        return [
            'id' => $id,
            'type' => $type->value,
            'points' => $points,
            'correct_option_ids' => $correctOptionIds,
            'answer_key' => null,
        ];
    }
}
