<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use App\Domain\Catalog\Enums\LessonType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('section')?->course ?? $this->route('lesson')?->course;

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
            'type' => [$required, Rule::in(LessonType::values())],
            'content' => ['nullable', 'string', 'max:100000'],
            'video_url' => ['nullable', 'url', 'max:500'],
            'video_duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'duration_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*.name' => ['required_with:attachments', 'string', 'max:180'],
            'attachments.*.url' => ['required_with:attachments', 'url', 'max:500'],
            'is_preview' => ['sometimes', 'boolean'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}
