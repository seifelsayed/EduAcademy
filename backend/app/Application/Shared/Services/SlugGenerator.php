<?php

declare(strict_types=1);

namespace App\Application\Shared\Services;

use Illuminate\Support\Str;

/**
 * Produces URL slugs that are unique according to a caller-supplied check,
 * so the Application layer never has to query for collisions itself.
 */
final class SlugGenerator
{
    /**
     * @param  callable(string): bool  $exists  Returns true when the slug is taken.
     */
    public function unique(string $source, callable $exists, int $maxAttempts = 100): string
    {
        $base = Str::slug($source) ?: Str::random(8);
        $candidate = $base;
        $suffix = 1;

        while ($exists($candidate)) {
            if ($suffix >= $maxAttempts) {
                // Extremely unlikely; fall back to a random suffix rather than loop.
                return $base.'-'.Str::lower(Str::random(6));
            }

            $candidate = $base.'-'.(++$suffix);
        }

        return $candidate;
    }
}
