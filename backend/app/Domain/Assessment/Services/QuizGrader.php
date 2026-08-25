<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Services;

use App\Domain\Assessment\Enums\QuestionType;

/**
 * Grades a quiz attempt from plain arrays. Deliberately free of Eloquent so the
 * grading rules can be unit-tested without a database.
 */
final class QuizGrader
{
    /**
     * @param  array<int, array{id: int, type: string, points: int, correct_option_ids: array<int, int>, answer_key: string|null}>  $questions
     * @param  array<int, array{question_id: int, option_ids?: array<int, int>, text?: string|null}>  $responses
     * @return array{
     *     score: float,
     *     earned_points: int,
     *     total_points: int,
     *     correct_count: int,
     *     question_count: int,
     *     breakdown: array<int, array{question_id: int, is_correct: bool, earned_points: int, points: int}>
     * }
     */
    public function grade(array $questions, array $responses): array
    {
        $responsesByQuestion = [];
        foreach ($responses as $response) {
            $responsesByQuestion[(int) $response['question_id']] = $response;
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $correctCount = 0;
        $breakdown = [];

        foreach ($questions as $question) {
            $points = max(0, (int) $question['points']);
            $totalPoints += $points;

            $response = $responsesByQuestion[(int) $question['id']] ?? null;
            $isCorrect = $response !== null && $this->isResponseCorrect($question, $response);

            if ($isCorrect) {
                $earnedPoints += $points;
                $correctCount++;
            }

            $breakdown[] = [
                'question_id' => (int) $question['id'],
                'is_correct' => $isCorrect,
                'earned_points' => $isCorrect ? $points : 0,
                'points' => $points,
            ];
        }

        return [
            'score' => $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0.0,
            'earned_points' => $earnedPoints,
            'total_points' => $totalPoints,
            'correct_count' => $correctCount,
            'question_count' => count($questions),
            'breakdown' => $breakdown,
        ];
    }

    public function hasPassed(float $score, int $passingScore): bool
    {
        return $score >= $passingScore;
    }

    /**
     * @param  array{id: int, type: string, points: int, correct_option_ids: array<int, int>, answer_key: string|null}  $question
     * @param  array{question_id: int, option_ids?: array<int, int>, text?: string|null}  $response
     */
    private function isResponseCorrect(array $question, array $response): bool
    {
        $type = QuestionType::from($question['type']);

        if (! $type->isOptionBased()) {
            return $this->matchesAnswerKey($question['answer_key'] ?? null, $response['text'] ?? null);
        }

        $expected = array_map('intval', $question['correct_option_ids']);
        $given = array_map('intval', $response['option_ids'] ?? []);

        sort($expected);
        $given = array_values(array_unique($given));
        sort($given);

        return $expected === $given;
    }

    private function matchesAnswerKey(?string $answerKey, ?string $given): bool
    {
        if ($answerKey === null || $given === null) {
            return false;
        }

        $normalise = static fn (string $value): string => preg_replace('/\s+/', ' ', mb_strtolower(trim($value))) ?? '';

        // The answer key may list several accepted answers separated by "|".
        foreach (explode('|', $answerKey) as $accepted) {
            if ($normalise($accepted) === $normalise($given)) {
                return true;
            }
        }

        return false;
    }
}
