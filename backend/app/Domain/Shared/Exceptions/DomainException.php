<?php

declare(strict_types=1);

namespace App\Domain\Shared\Exceptions;

use RuntimeException;

/**
 * Base class for every rule violation raised by the Domain layer.
 *
 * The Presentation layer translates these into HTTP responses, so the Domain
 * never needs to know about HTTP status codes beyond the coarse hint below.
 */
abstract class DomainException extends RuntimeException
{
    /**
     * Machine-readable error code sent to API clients.
     */
    abstract public function errorCode(): string;

    /**
     * Suggested HTTP status for the Presentation layer.
     */
    public function statusCode(): int
    {
        return 422;
    }

    /**
     * Extra context serialised alongside the error message.
     *
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return [];
    }
}
