<?php

declare(strict_types=1);

namespace App\Domain\Shared\Contracts;

use Closure;

/**
 * Port that lets Application use-cases run several repository writes atomically
 * without depending on Laravel's DB facade directly.
 */
interface TransactionManager
{
    /**
     * @template TReturn
     *
     * @param  Closure(): TReturn  $callback
     * @return TReturn
     */
    public function run(Closure $callback): mixed;
}
