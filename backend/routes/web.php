<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
| The frontend is a separate Vite SPA, so the web routes only need to describe
| the API itself. Everything functional lives in routes/api.php.
*/

Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'api' => url('/api/v1'),
    'docs' => 'See docs/API.md in the repository.',
    'health' => url('/up'),
]));
