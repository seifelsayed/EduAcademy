<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Domain\User\Enums\UserRole;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<User>
 */
final class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected function model(): string
    {
        return User::class;
    }

    public function findByEmail(string $email): ?User
    {
        return $this->query()->where('email', $email)->first();
    }

    public function emailExists(string $email, ?int $exceptId = null): bool
    {
        return $this->query()
            ->where('email', $email)
            ->when($exceptId !== null, fn ($q) => $q->whereKeyNot($exceptId))
            ->exists();
    }

    public function search(array $filters, int $perPage): LengthAwarePaginator
    {
        $term = isset($filters['search']) ? trim((string) $filters['search']) : '';

        return $this->query()
            ->when($term !== '', function ($query) use ($term) {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->when(! empty($filters['role']), fn ($q) => $q->where('role', $filters['role']))
            ->when(! empty($filters['status']), fn ($q) => $q->where('status', $filters['status']))
            ->withCount(['courses', 'enrollments'])
            ->latest()
            ->paginate($this->normalisePerPage($perPage));
    }

    public function paginateByRole(UserRole $role, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('role', $role->value)
            ->latest()
            ->paginate($this->normalisePerPage($perPage));
    }

    public function statistics(): array
    {
        return [
            'total' => $this->query()->count(),
            'students' => $this->query()->where('role', UserRole::Student->value)->count(),
            'instructors' => $this->query()->where('role', UserRole::Instructor->value)->count(),
            'admins' => $this->query()->where('role', UserRole::Admin->value)->count(),
            'new_this_month' => $this->query()->where('created_at', '>=', now()->startOfMonth())->count(),
        ];
    }

    public function topInstructors(int $limit): Collection
    {
        return $this->query()
            ->where('role', UserRole::Instructor->value)
            ->withCount('courses')
            ->withSum('courses as students_total', 'students_count')
            ->orderByDesc('students_total')
            ->limit($limit)
            ->get();
    }
}
