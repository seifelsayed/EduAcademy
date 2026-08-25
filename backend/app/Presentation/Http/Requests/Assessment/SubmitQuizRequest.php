<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class SubmitQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'answers' => ['present', 'array'],
            'answers.*.question_id' => ['required', 'integer', 'exists:questions,id'],
            'answers.*.option_ids' => ['nullable', 'array', 'max:10'],
            'answers.*.option_ids.*' => ['integer'],
            'answers.*.text' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<int, array{question_id: int, option_ids?: array<int, int>, text?: string|null}>
     */
    public function responses(): array
    {
        return array_map(static fn (array $answer): array => [
            'question_id' => (int) $answer['question_id'],
            'option_ids' => array_map('intval', $answer['option_ids'] ?? []),
            'text' => $answer['text'] ?? null,
        ], $this->validated()['answers'] ?? []);
    }
}
