<?php

declare(strict_types=1);

namespace App\Presentation\Http\Controllers;

use App\Infrastructure\Persistence\Eloquent\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * The authenticated user, typed. Routes behind `auth:sanctum` always have
     * one, so this saves every action a null check.
     */
    protected function user(Request $request): User
    {
        $user = $request->user() ?? $request->user('sanctum');

        if (! $user instanceof User) {
            throw ValidationException::withMessages(['auth' => 'Authentication required.']);
        }

        return $user;
    }

    /**
     * Optional user for public routes that can be viewed by guests or authenticated users.
     */
    protected function optionalUser(Request $request): ?User
    {
        $user = $request->user('sanctum') ?? $request->user();

        return $user instanceof User ? $user : null;
    }

    protected function perPage(Request $request): int
    {
        return (int) $request->integer('per_page', (int) config('platform.pagination.per_page', 15));
    }

}
