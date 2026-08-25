<?php

declare(strict_types=1);

namespace App\Application\Auth\DTOs;

final readonly class LoginData
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $remember = false,
        public ?string $deviceName = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            email: mb_strtolower(trim((string) $data['email'])),
            password: (string) $data['password'],
            remember: (bool) ($data['remember'] ?? false),
            deviceName: isset($data['device_name']) ? (string) $data['device_name'] : null,
        );
    }
}
