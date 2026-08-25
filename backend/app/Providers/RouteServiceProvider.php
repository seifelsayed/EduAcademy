<?php

declare(strict_types=1);

namespace App\Providers;

use App\Presentation\Http\Responses\ApiResponse;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

final class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)
            ->by($request->user()?->getAuthIdentifier() ?? $request->ip()));

        // Credential endpoints get a much tighter budget, keyed by email so one
        // attacker cannot lock every user out from a shared IP.
        RateLimiter::for('auth', fn (Request $request) => [
            Limit::perMinute(5)->by(mb_strtolower((string) $request->input('email')).'|'.$request->ip())
                ->response(fn () => ApiResponse::error(
                    'Too many attempts. Try again in a minute.',
                    'rate_limited',
                    429,
                )),
            Limit::perMinute(20)->by((string) $request->ip()),
        ]);

        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(30)
            ->by($request->user()?->getAuthIdentifier() ?? $request->ip()));
    }
}
