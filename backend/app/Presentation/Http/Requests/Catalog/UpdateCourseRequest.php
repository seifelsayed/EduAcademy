<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use App\Domain\Catalog\Enums\CourseLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('course')) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxImageKb = (int) config('platform.uploads.max_image_kb', 4096);

        return [
            'title' => ['sometimes', 'string', 'min:5', 'max:180'],
            'subtitle' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:categories,id'],
            'level' => ['sometimes', Rule::in(CourseLevel::values())],
            'language' => ['sometimes', 'string', 'max:32'],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:99999'],
            'discount_price' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999'],
            'promo_video_url' => ['sometimes', 'nullable', 'url', 'max:255'],
            'requirements' => ['sometimes', 'nullable', 'array', 'max:20'],
            'requirements.*' => ['string', 'max:255'],
            'outcomes' => ['sometimes', 'nullable', 'array', 'max:20'],
            'outcomes.*' => ['string', 'max:255'],
            'target_audience' => ['sometimes', 'nullable', 'array', 'max:20'],
            'target_audience.*' => ['string', 'max:255'],
            'thumbnail' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$maxImageKb}"],
        ];
    }
}
