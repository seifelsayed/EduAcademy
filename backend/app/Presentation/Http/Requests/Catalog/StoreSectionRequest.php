<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

final class StoreSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $course = $this->route('course') ?? $this->route('section')?->course;

        return $this->user()?->can('manageCurriculum', $course) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:180'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
