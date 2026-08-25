<?php

declare(strict_types=1);

namespace App\Application\Auth\DTOs;

use App\Domain\User\Enums\UserRole;

final readonly class RegisterUserData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public UserRole $role,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: trim((string) $data['name']),
            email: mb_strtolower(trim((string) $data['email'])),
            password: (string) $data['password'],
            role: UserRole::from((string) ($data['role'] ?? UserRole::Student->value)),
        );
    }
}
