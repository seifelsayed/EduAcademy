<?php

declare(strict_types=1);

namespace App\Domain\Shared\Exceptions;

/**
 * Generic, named rule violation. Prefer this over inventing a new exception
 * class for every single rule; the error code keeps the failure identifiable.
 */
final class BusinessRuleViolation extends DomainException
{
    private readonly string $errorCode;
    private readonly int $status;
    /** @var array<string, mixed> */
    private readonly array $context;

    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        string $message,
        string $code = 'business_rule_violation',
        int $status = 422,
        array $context = [],
    ) {
        parent::__construct($message);

        $this->errorCode = $code;
        $this->status = $status;
        $this->context = $context;
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }

    public function statusCode(): int
    {
        return $this->status;
    }

    /**
     * @return array<string, mixed>
     */
    public function context(): array
    {
        return $this->context;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function forbidden(string $message, string $code = 'forbidden', array $context = []): self
    {
        return new self($message, $code, 403, $context);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function conflict(string $message, string $code = 'conflict', array $context = []): self
    {
        return new self($message, $code, 409, $context);
    }

    /**
     * @param  array<string, mixed>  $context
     */
    public static function notFound(string $message, string $code = 'not_found', array $context = []): self
    {
        return new self($message, $code, 404, $context);
    }
}
