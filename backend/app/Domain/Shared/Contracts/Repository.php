<?php

declare(strict_types=1);

namespace App\Domain\Shared\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared read/write surface every aggregate repository exposes.
 *
 * Repositories return Eloquent models as the persistence representation of an
 * aggregate. The Application layer treats them as opaque records: it never
 * builds queries, only calls the intention-revealing methods declared here and
 * on the per-aggregate interfaces.
 *
 * @template TModel of Model
 */
interface Repository
{
    /**
     * @return TModel|null
     */
    public function find(int $id): ?Model;

    /**
     * @return TModel
     */
    public function findOrFail(int $id): Model;

    /**
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function create(array $attributes): Model;

    /**
     * @param  TModel  $model
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function update(Model $model, array $attributes): Model;

    /**
     * @param  TModel  $model
     */
    public function delete(Model $model): void;

    /**
     * @return Collection<int, TModel>
     */
    public function all(): Collection;

    /**
     * @return LengthAwarePaginator<int, TModel>
     */
    public function paginate(int $perPage): LengthAwarePaginator;
}
