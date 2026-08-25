<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class GradeSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('grade', $this->route('submission')) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'score' => ['required', 'integer', 'min:0'],
            'feedback' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
