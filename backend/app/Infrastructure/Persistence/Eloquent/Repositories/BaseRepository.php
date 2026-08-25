<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\Eloquent\Repositories;

use App\Domain\Shared\Contracts\Repository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared Eloquent plumbing. Concrete repositories declare the model they own
 * and add intention-revealing query methods on top.
 *
 * @template TModel of Model
 *
 * @implements Repository<TModel>
 */
abstract class BaseRepository implements Repository
{
    /**
     * @return class-string<TModel>
     */
    abstract protected function model(): string;

    /**
     * @return Builder<TModel>
     */
    protected function query(): Builder
    {
        return $this->model()::query();
    }

    /**
     * @return TModel|null
     */
    public function find(int $id): ?Model
    {
        return $this->query()->find($id);
    }

    /**
     * @return TModel
     */
    public function findOrFail(int $id): Model
    {
        return $this->query()->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function create(array $attributes): Model
    {
        return $this->query()->create($attributes);
    }

    /**
     * @param  TModel  $model
     * @param  array<string, mixed>  $attributes
     * @return TModel
     */
    public function update(Model $model, array $attributes): Model
    {
        $model->fill($attributes)->save();

        return $model->refresh();
    }

    /**
     * @param  TModel  $model
     */
    public function delete(Model $model): void
    {
        $model->delete();
    }

    /**
     * @return Collection<int, TModel>
     */
    public function all(): Collection
    {
        return $this->query()->get();
    }

    /**
     * @return LengthAwarePaginator<int, TModel>
     */
    public function paginate(int $perPage): LengthAwarePaginator
    {
        return $this->query()->paginate($this->normalisePerPage($perPage));
    }

    /**
     * Guards against clients requesting an unbounded page size.
     */
    protected function normalisePerPage(int $perPage): int
    {
        $max = (int) config('platform.pagination.max_per_page', 100);

        return max(1, min($perPage, $max));
    }
}
