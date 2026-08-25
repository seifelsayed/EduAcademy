<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

final class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('access-admin') === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'min:2', 'max:120'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:64'],
            'color' => ['nullable', 'string', 'max:32'],
            'position' => ['nullable', 'integer', 'min:0', 'max:999'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
