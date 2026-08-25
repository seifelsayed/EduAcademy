<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence;

use App\Domain\Shared\Contracts\TransactionManager;
use Closure;
use Illuminate\Support\Facades\DB;

final class DatabaseTransactionManager implements TransactionManager
{
    /**
     * @template TReturn
     *
     * @param  Closure(): TReturn  $callback
     * @return TReturn
     */
    public function run(Closure $callback): mixed
    {
        return DB::transaction($callback);
    }
}
