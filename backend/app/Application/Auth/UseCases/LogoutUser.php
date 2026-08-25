<?php

declare(strict_types=1);

namespace App\Application\Auth\UseCases;

use App\Infrastructure\Persistence\Eloquent\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

final readonly class LogoutUser
{
    /**
     * Revokes the token used for the current request, leaving the user's other
     * devices signed in.
     */
    public function execute(User $user, bool $allDevices = false): void
    {
        if ($allDevices) {
            $user->tokens()->delete();

            return;
        }

        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }
    }
}
