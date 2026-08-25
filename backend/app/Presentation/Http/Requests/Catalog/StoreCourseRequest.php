<?php

declare(strict_types=1);

namespace App\Presentation\Http\Requests\Catalog;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Course::class) === true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxImageKb = (int) config('platform.uploads.max_image_kb', 4096);

        return [
            'title' => ['required', 'string', 'min:5', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:20000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'level' => ['nullable', Rule::in(CourseLevel::values())],
            'language' => ['nullable', 'string', 'max:32'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'discount_price' => ['nullable', 'numeric', 'min:0', 'max:99999', 'lte:price'],
            'promo_video_url' => ['nullable', 'url', 'max:255'],
            'requirements' => ['nullable', 'array', 'max:20'],
            'requirements.*' => ['string', 'max:255'],
            'outcomes' => ['nullable', 'array', 'max:20'],
            'outcomes.*' => ['string', 'max:255'],
            'target_audience' => ['nullable', 'array', 'max:20'],
            'target_audience.*' => ['string', 'max:255'],
            'thumbnail' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', "max:{$maxImageKb}"],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'discount_price.lte' => 'The discounted price cannot exceed the regular price.',
        ];
    }
}
