<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin QuizAttempt
 */
final class QuizAttemptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'status' => $this->status?->value ?? (is_string($this->status) ? $this->status : 'in_progress'),
            'attempt_number' => $this->attempt_number,
            'score' => round($this->score, 2),
            'earned_points' => $this->earned_points,
            'total_points' => $this->total_points,
            'correct_count' => $this->correct_count,
            'question_count' => $this->question_count,
            'passed' => $this->passed,
            'started_at' => $this->started_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'seconds_remaining' => $this->when(
                $this->expires_at !== null && is_object($this->status) && method_exists($this->status, 'isFinal') && ! $this->status->isFinal(),
                fn (): int => max(0, (int) now()->diffInSeconds($this->expires_at, false)),
            ),


            'answers' => $this->whenLoaded('answers', fn () => $this->answers->map(fn ($answer): array => [
                'question_id' => $answer->question_id,
                'selected_option_ids' => $answer->selected_option_ids ?? [],
                'text_answer' => $answer->text_answer,
                'is_correct' => $answer->is_correct,
                'earned_points' => $answer->earned_points,
            ])->values()),

            'quiz' => $this->whenLoaded('quiz', fn () => $this->quiz ? new QuizResource($this->quiz) : null),
        ];
    }
}
