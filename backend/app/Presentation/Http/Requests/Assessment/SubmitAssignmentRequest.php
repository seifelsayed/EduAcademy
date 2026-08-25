<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Assessment;

use Illuminate\Foundation\Http\FormRequest;

final class SubmitAssignmentRequest extends FormRequest
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
            'content' => ['required_without:attachments', 'nullable', 'string', 'max:50000'],
            'attachments' => ['required_without:content', 'nullable', 'array', 'max:10'],
            'attachments.*.name' => ['required_with:attachments', 'string', 'max:180'],
            'attachments.*.url' => ['required_with:attachments', 'url', 'max:500'],
            'as_draft' => ['sometimes', 'boolean'],
        ];
    }
}
