<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateProfileRequest extends FormRequest
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
        $maxImageKb = (int) config('platform.uploads.max_image_kb', 4096);

        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'email:rfc', 'max:255'],
            'headline' => ['sometimes', 'nullable', 'string', 'max:180'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'locale' => ['sometimes', 'string', 'max:8'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'social_links' => ['sometimes', 'nullable', 'array'],
            'social_links.*' => ['nullable', 'url', 'max:255'],
            'avatar' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$maxImageKb}"],
        ];
    }
}
