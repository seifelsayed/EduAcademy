<?php

declare(strict_types=1);

namespace Tests\Unit\Domain;

use App\Domain\Billing\Services\PricingService;
use App\Domain\Shared\ValueObjects\Money;
use PHPUnit\Framework\TestCase;

final class PricingServiceTest extends TestCase
{
    private PricingService $pricing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pricing = new PricingService(commissionRate: 0.20);
    }

    public function test_the_discounted_price_wins_when_it_is_actually_lower(): void
    {
        $price = Money::fromCents(10000, 'USD');
        $discount = Money::fromCents(6000, 'USD');

        $this->assertSame(6000, $this->pricing->effectivePrice($price, $discount)->amountInCents);
    }

    public function test_a_discount_above_the_list_price_is_ignored(): void
    {
        $price = Money::fromCents(5000, 'USD');
        $discount = Money::fromCents(9000, 'USD');

        $this->assertSame(5000, $this->pricing->effectivePrice($price, $discount)->amountInCents);
        $this->assertSame(0, $this->pricing->discountPercent($price, $discount));
    }

    public function test_discount_percent_is_rounded_to_a_whole_number(): void
    {
        $this->assertSame(
            40,
            $this->pricing->discountPercent(Money::fromCents(10000, 'USD'), Money::fromCents(6000, 'USD')),
        );
    }

    public function test_the_split_always_adds_back_up_to_the_total(): void
    {
        $split = $this->pricing->split(Money::fromCents(9999, 'USD'));

        $this->assertSame(
            9999,
            $split['platform_fee']->amountInCents + $split['instructor_payout']->amountInCents,
        );
    }

    public function test_a_free_course_produces_no_fee(): void
    {
        $split = $this->pricing->split(Money::zero('USD'));

        $this->assertSame(0, $split['platform_fee']->amountInCents);
        $this->assertSame(0, $split['instructor_payout']->amountInCents);
    }
}
