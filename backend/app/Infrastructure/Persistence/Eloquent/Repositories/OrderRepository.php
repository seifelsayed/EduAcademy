<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Billing\Contracts\OrderRepositoryInterface;
use App\Domain\Billing\Enums\OrderStatus;
use App\Infrastructure\Persistence\Eloquent\Models\Course;
use App\Infrastructure\Persistence\Eloquent\Models\Order;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * @extends BaseRepository<Order>
 */
final class OrderRepository extends BaseRepository implements OrderRepositoryInterface
{
    protected function model(): string
    {
        return Order::class;
    }

    public function findByReference(string $reference): ?Order
    {
        return $this->query()
            ->with(['course:id,title,slug,thumbnail_path', 'user:id,name,email'])
            ->where('reference', $reference)
            ->first();
    }

    public function hasPaidOrder(User $student, Course $course): bool
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->where('course_id', $course->id)
            ->where('status', OrderStatus::Paid->value)
            ->exists();
    }

    public function paginateForStudent(User $student, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $student->id)
            ->with(['course:id,title,slug,thumbnail_path'])
            ->latest()
            ->paginate($this->normalisePerPage($perPage));
    }

    public function paginateAll(?OrderStatus $status, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->when($status !== null, fn ($q) => $q->where('status', $status->value))
            ->with(['course:id,title,slug', 'user:id,name,email'])
            ->latest()
            ->paginate($this->normalisePerPage($perPage));
    }

    public function totalRevenueCents(?int $instructorId = null): int
    {
        return (int) $this->query()
            ->paid()
            ->when($instructorId !== null, fn ($q) => $q->whereHas(
                'course',
                fn ($c) => $c->where('instructor_id', $instructorId)
            ))
            // Instructors see their payout; the platform sees gross revenue.
            ->sum($instructorId !== null ? 'instructor_payout_cents' : 'total_cents');
    }

    public function dailyRevenueCents(int $days, ?int $instructorId = null): array
    {
        $column = $instructorId !== null ? 'instructor_payout_cents' : 'total_cents';

        $rows = $this->query()
            ->paid()
            ->when($instructorId !== null, fn ($q) => $q->whereHas(
                'course',
                fn ($c) => $c->where('instructor_id', $instructorId)
            ))
            ->where('paid_at', '>=', now()->subDays($days)->startOfDay())
            ->select(DB::raw('DATE(paid_at) as day'), DB::raw("SUM({$column}) as total"))
            ->groupBy('day')
            ->pluck('total', 'day');

        $series = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $series[$day] = (int) ($rows[$day] ?? 0);
        }

        return $series;
    }
}
