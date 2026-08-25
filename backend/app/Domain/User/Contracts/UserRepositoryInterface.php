<?php

declare(strict_types=1);

namespace App\Domain\User\Contracts;

use App\Domain\Shared\Contracts\Repository;
use App\Domain\User\Enums\UserRole;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends Repository<User>
 */
interface UserRepositoryInterface extends Repository
{
    public function findByEmail(string $email): ?User;

    public function emailExists(string $email, ?int $exceptId = null): bool;

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, User>
     */
    public function search(array $filters, int $perPage): LengthAwarePaginator;

    /**
     * @return LengthAwarePaginator<int, User>
     */
    public function paginateByRole(UserRole $role, int $perPage): LengthAwarePaginator;

    /**
     * Aggregate counters used by the admin dashboard.
     *
     * @return array{total: int, students: int, instructors: int, admins: int, new_this_month: int}
     */
    public function statistics(): array;

    /**
     * Instructors ordered by number of enrolled students.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, User>
     */
    public function topInstructors(int $limit): \Illuminate\Database\Eloquent\Collection;
}
