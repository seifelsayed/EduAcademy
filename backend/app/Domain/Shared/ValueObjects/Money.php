<?php

declare(strict_types=1);

namespace App\Domain\Shared\ValueObjects;

use InvalidArgumentException;

/**
 * Money stored as integer minor units (cents) to avoid float rounding drift.
 */
final readonly class Money
{
    private function __construct(
        public int $amountInCents,
        public string $currency,
    ) {
        if ($amountInCents < 0) {
            throw new InvalidArgumentException('Money cannot be negative.');
        }
    }

    public static function fromCents(int $cents, ?string $currency = null): self
    {
        return new self($cents, $currency ?? self::defaultCurrency());
    }

    public static function fromMajorUnits(float|int|string $amount, ?string $currency = null): self
    {
        return new self((int) round(((float) $amount) * 100), $currency ?? self::defaultCurrency());
    }

    public static function zero(?string $currency = null): self
    {
        return new self(0, $currency ?? self::defaultCurrency());
    }

    public function isFree(): bool
    {
        return $this->amountInCents === 0;
    }

    public function toMajorUnits(): float
    {
        return round($this->amountInCents / 100, 2);
    }

    public function multipliedBy(float $factor): self
    {
        return new self((int) round($this->amountInCents * $factor), $this->currency);
    }

    public function minus(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self(max(0, $this->amountInCents - $other->amountInCents), $this->currency);
    }

    public function plus(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->amountInCents + $other->amountInCents, $this->currency);
    }

    /**
     * Applies a percentage discount (0-100) and returns the reduced amount.
     */
    public function withDiscountPercent(float $percent): self
    {
        $percent = max(0.0, min(100.0, $percent));

        return $this->multipliedBy(1 - ($percent / 100));
    }

    public function equals(self $other): bool
    {
        return $this->amountInCents === $other->amountInCents
            && $this->currency === $other->currency;
    }

    public function format(): string
    {
        return sprintf('%s %s', number_format($this->toMajorUnits(), 2), $this->currency);
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException('Cannot combine amounts in different currencies.');
        }
    }

    private static function defaultCurrency(): string
    {
        return (string) config('platform.currency', 'USD');
    }
}
