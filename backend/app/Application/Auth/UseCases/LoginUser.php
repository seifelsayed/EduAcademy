<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases;

use App\Application\Auth\DTOs\LoginData;
use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Support\Facades\Hash;

final readonly class LoginUser
{
    public function __construct(
        private UserRepositoryInterface $users,
    ) {}

    /**
     * @return array{user: User, token: string}
     */
    public function execute(LoginData $data): array
    {
        $user = $this->users->findByEmail($data->email);

        // Always run a hash check so a missing account and a wrong password
        // take the same amount of time.
        $passwordMatches = $user !== null
            ? Hash::check($data->password, $user->password)
            : Hash::check($data->password, '$2y$10$h8YzNKs.j8N.VEUT.goRqevsvgnVMrJlCcGCgYLdLPvIGCyvtkV.W');

        if ($user === null || ! $passwordMatches) {
            throw new BusinessRuleViolation(
                'These credentials do not match our records.',
                'invalid_credentials',
                401,
            );
        }

        if (! $user->isActive()) {
            throw BusinessRuleViolation::forbidden(
                'This account is not active. Please contact support.',
                'account_inactive',
                ['status' => $user->status->value],
            );
        }

        $this->users->update($user, ['last_login_at' => now()]);

        return [
            'user' => $user,
            'token' => $user->createToken($data->deviceName ?? 'web')->plainTextToken,
        ];
    }
}
