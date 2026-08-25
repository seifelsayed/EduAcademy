<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('lesson')?->course ?? $this->route('assignment')?->lesson->course;

        return $this->user()?->can('manageCurriculum', $course) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'title' => [$required, 'string', 'min:2', 'max:180'],
            'instructions' => ['nullable', 'string', 'max:20000'],
            'max_points' => ['sometimes', 'integer', 'min:1', 'max:1000'],
            'due_at' => ['nullable', 'date'],
            'allow_late_submissions' => ['sometimes', 'boolean'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*.name' => ['required_with:attachments', 'string', 'max:180'],
            'attachments.*.url' => ['required_with:attachments', 'url', 'max:500'],
        ];
    }
}
