<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class StoreQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('lesson')?->course ?? $this->route('quiz')?->lesson->course;

        return $this->user()?->can('manageCurriculum', $course) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'min:2', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'passing_score' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'max_attempts' => ['nullable', 'integer', 'min:1', 'max:100'],
            'shuffle_questions' => ['sometimes', 'boolean'],
            'show_correct_answers' => ['sometimes', 'boolean'],
        ];
    }
}
