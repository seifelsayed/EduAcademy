<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

final class ReorderRequest extends FormRequest
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
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }

    /**
     * @return array<int, int>
     */
    public function orderedIds(): array
    {
        return array_map('intval', $this->validated()['ids']);
    }
}
