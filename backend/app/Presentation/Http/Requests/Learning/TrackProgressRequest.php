<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Learning;

use Illuminate\Foundation\Http\FormRequest;

final class TrackProgressRequest extends FormRequest
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
            'watched_seconds' => ['required', 'integer', 'min:0', 'max:86400'],
            'position_seconds' => ['required', 'integer', 'min:0', 'max:86400'],
        ];
    }
}
