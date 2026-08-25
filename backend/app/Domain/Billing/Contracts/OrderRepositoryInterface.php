<?php

declare(strict_types=1);

namespace App\Domain\Billing\Contracts;

use App\Domain\Billing\Enums\OrderStatus;
use App\Domain\Shared\Contracts\Repository;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Order;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends Repository<Order>
 */
interface OrderRepositoryInterface extends Repository
{
    public function findByReference(string $reference): ?Order;

    public function hasPaidOrder(User $student, Course $course): bool;

    /**
     * @return LengthAwarePaginator<int, Order>
     */
    public function paginateForStudent(User $student, int $perPage): LengthAwarePaginator;

    /**
     * @return LengthAwarePaginator<int, Order>
     */
    public function paginateAll(?OrderStatus $status, int $perPage): LengthAwarePaginator;

    /**
     * Gross revenue in cents, optionally scoped to one instructor.
     */
    public function totalRevenueCents(?int $instructorId = null): int;

    /**
     * Revenue in cents per day for the last N days, keyed by Y-m-d.
     *
     * @return array<string, int>
     */
    public function dailyRevenueCents(int $days, ?int $instructorId = null): array;
}
