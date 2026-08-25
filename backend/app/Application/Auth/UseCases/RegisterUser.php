<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases;

use App\Application\Auth\DTOs\RegisterUserData;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Domain\User\Enums\UserRole;
use App\Domain\User\Enums\UserStatus;
use App\Infrastructure\Persistence\Eloquent\Models\User;

final readonly class RegisterUser
{
    public function __construct(
        private UserRepositoryInterface $users,
    ) {}

    /**
     * @return array{user: User, token: string}
     */
    public function execute(RegisterUserData $data): array
    {
        if (! in_array($data->role->value, UserRole::selfAssignable(), true)) {
            throw BusinessRuleViolation::forbidden(
                'That role cannot be selected during registration.',
                'role_not_self_assignable',
            );
        }

        if ($this->users->emailExists($data->email)) {
            throw BusinessRuleViolation::conflict(
                'An account with that email already exists.',
                'email_taken',
            );
        }

        $user = $this->users->create([
            'name' => $data->name,
            'email' => $data->email,
            'password' => $data->password,
            'role' => $data->role->value,
            'status' => UserStatus::Active->value,
        ]);

        return [
            'user' => $user,
            'token' => $user->createToken('registration')->plainTextToken,
        ];
    }
}
