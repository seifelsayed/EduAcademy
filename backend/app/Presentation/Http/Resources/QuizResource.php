<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Quiz
 */
final class QuizResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_id' => $this->lesson_id,
            'title' => $this->title,
            'description' => $this->description,
            'time_limit_minutes' => $this->time_limit_minutes,
            'passing_score' => $this->passing_score,
            'max_attempts' => $this->max_attempts,
            'shuffle_questions' => $this->shuffle_questions,
            'show_correct_answers' => $this->show_correct_answers,
            'questions_count' => $this->whenLoaded('questions', fn () => $this->questions->count()),
            'total_points' => $this->whenLoaded('questions', fn () => (int) $this->questions->sum('points')),
            'questions' => QuestionResource::collection($this->whenLoaded('questions')),

            // Populated by the attempt endpoints.
            'used_attempts' => $this->when(isset($this->used_attempts), fn () => (int) $this->used_attempts),
            'best_score' => $this->when(isset($this->best_score), fn () => (float) $this->best_score),
        ];
    }
}
