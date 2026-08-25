<?php

declare(strict_types=1);

namespace App\Presentation\Http\Middleware;

use App\Infrastructure\Persistence\Eloquent\Models\User;
use App\Presentation\Http\Responses\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks suspended accounts that still hold a valid token.
 */
final class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User && ! $user->isActive()) {
            return ApiResponse::error(
                'Your account is not active. Please contact support.',
                'account_inactive',
                403,
                ['status' => $user->status->value],
            );
        }

        return $next($request);
    }
}
