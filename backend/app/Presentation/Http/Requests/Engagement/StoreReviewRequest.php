<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Engagement;

use Illuminate\Foundation\Http\FormRequest;

final class StoreReviewRequest extends FormRequest
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
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:180'],
            'comment' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
