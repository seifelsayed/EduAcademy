<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases;

use App\Domain\Shared\Exceptions\BusinessRuleViolation;
use App\Domain\User\Contracts\UserRepositoryInterface;
use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

final readonly class ChangePassword
{
    public function __construct(
        private UserRepositoryInterface $users,
    ) {}

    public function execute(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw new BusinessRuleViolation(
                'Your current password is incorrect.',
                'invalid_current_password',
                422,
                ['field' => 'current_password'],
            );
        }

        if (Hash::check($newPassword, $user->password)) {
            throw new BusinessRuleViolation(
                'The new password must differ from the current one.',
                'password_unchanged',
                422,
                ['field' => 'password'],
            );
        }

        $this->users->update($user, ['password' => $newPassword]);

        // Changing a password signs every other device out. Session-based
        // callers hold a TransientToken, which has no id to preserve — in that
        // case every issued token goes.
        $currentToken = $user->currentAccessToken();
        $currentTokenId = $currentToken instanceof PersonalAccessToken
            ? $currentToken->getKey()
            : null;

        $user->tokens()
            ->when($currentTokenId !== null, fn ($q) => $q->whereKeyNot($currentTokenId))
            ->delete();
    }
}
