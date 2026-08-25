<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use App\Domain\Assessment\Enums\QuestionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $quiz = $this->route('quiz') ?? $this->route('question')?->quiz;

        return $this->user()?->can('manageCurriculum', $quiz?->lesson->course) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'type' => [$required, Rule::in(QuestionType::values())],
            'prompt' => [$required, 'string', 'min:2', 'max:2000'],
            'explanation' => ['nullable', 'string', 'max:2000'],
            'points' => ['sometimes', 'integer', 'min:1', 'max:100'],

            // Short-answer questions carry a key; choice questions carry options.
            'answer_key' => ['required_if:type,short_answer', 'nullable', 'string', 'max:500'],
            'options' => ['exclude_if:type,short_answer', 'required', 'array', 'min:2', 'max:10'],
            'options.*.text' => ['required', 'string', 'max:500'],
            'options.*.is_correct' => ['required', 'boolean'],
        ];
    }
}
