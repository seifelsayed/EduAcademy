<?php

declare(strict_types=1);

namespace App\Presentation\Http\Resources;

use App\Infrastructure\Persistence\Eloquent\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Question
 */
final class QuestionResource extends JsonResource
{
    /**
     * Answer keys are exposed only to whoever can edit the quiz — the flag is
     * set by the controller, never inferred here.
     */
    public function toArray(Request $request): array
    {
        $revealAnswers = (bool) ($this->reveal_answers ?? false);

        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'type' => $this->type?->value ?? (is_string($this->type) ? $this->type : 'single_choice'),
            'prompt' => $this->prompt,

            'points' => $this->points,
            'position' => $this->position,

            'explanation' => $this->when($revealAnswers, $this->explanation),
            'answer_key' => $this->when($revealAnswers, $this->answer_key),

            'options' => $this->whenLoaded('options', fn () => $this->options->map(fn ($option): array => array_filter([
                'id' => $option->id,
                'text' => $option->text,
                'position' => $option->position,
                'is_correct' => $revealAnswers ? $option->is_correct : null,
            ], static fn (mixed $v): bool => $v !== null))->values()),
        ];
    }
}
