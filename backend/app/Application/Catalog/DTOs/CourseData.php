<?php

declare(strict_types=1);

namespace App\Application\Catalog\DTOs;

use App\Domain\Catalog\Enums\CourseLevel;
use Illuminate\Http\UploadedFile;

final readonly class CourseData
{
    /**
     * @param  array<int, string>|null  $requirements
     * @param  array<int, string>|null  $outcomes
     * @param  array<int, string>|null  $targetAudience
     */
    public function __construct(
        public ?string $title = null,
        public ?string $subtitle = null,
        public ?string $description = null,
        public ?int $categoryId = null,
        public ?CourseLevel $level = null,
        public ?string $language = null,
        public ?int $priceCents = null,
        public ?int $discountPriceCents = null,
        public ?string $promoVideoUrl = null,
        public ?array $requirements = null,
        public ?array $outcomes = null,
        public ?array $targetAudience = null,
        public ?UploadedFile $thumbnail = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, ?UploadedFile $thumbnail = null): self
    {
        return new self(
            title: isset($data['title']) ? trim((string) $data['title']) : null,
            subtitle: isset($data['subtitle']) ? trim((string) $data['subtitle']) : null,
            description: $data['description'] ?? null,
            categoryId: isset($data['category_id']) && $data['category_id'] !== '' && $data['category_id'] !== null ? (int) $data['category_id'] : null,
            level: isset($data['level']) && is_string($data['level']) ? (CourseLevel::tryFrom($data['level']) ?? CourseLevel::AllLevels) : null,
            language: $data['language'] ?? null,
            priceCents: isset($data['price']) && $data['price'] !== '' && $data['price'] !== null ? (int) round(((float) $data['price']) * 100) : null,
            discountPriceCents: isset($data['discount_price']) && $data['discount_price'] !== null && $data['discount_price'] !== ''
                ? (int) round(((float) $data['discount_price']) * 100)
                : null,
            promoVideoUrl: $data['promo_video_url'] ?? null,
            requirements: isset($data['requirements']) ? array_values((array) $data['requirements']) : null,
            outcomes: isset($data['outcomes']) ? array_values((array) $data['outcomes']) : null,
            targetAudience: isset($data['target_audience']) ? array_values((array) $data['target_audience']) : null,
            thumbnail: $thumbnail,

        );
    }

    /**
     * Only the fields the caller actually supplied, ready for a partial update.
     *
     * @return array<string, mixed>
     */
    public function toAttributes(): array
    {
        return array_filter([
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'category_id' => $this->categoryId,
            'level' => $this->level?->value,
            'language' => $this->language,
            'price_cents' => $this->priceCents,
            'discount_price_cents' => $this->discountPriceCents,
            'promo_video_url' => $this->promoVideoUrl,
            'requirements' => $this->requirements,
            'outcomes' => $this->outcomes,
            'target_audience' => $this->targetAudience,
        ], static fn (mixed $value): bool => $value !== null);
    }
}
