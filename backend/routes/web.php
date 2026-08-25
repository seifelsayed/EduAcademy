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
    'debug_db' => url('/debug-db'),
]))->withoutMiddleware([\Illuminate\Session\Middleware\StartSession::class]);

Route::get('/debug-db', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
        return response()->json([
            'status' => 'connected',
            'tables_count' => count($tables),
            'tables' => $tables,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'failed',
            'error' => $e->getMessage(),
            'default_connection' => config('database.default'),
            'host' => config('database.connections.mysql.host'),
            'port' => config('database.connections.mysql.port'),
            'database' => config('database.connections.mysql.database'),
            'username' => config('database.connections.mysql.username'),
        ], 200);
    }
})->withoutMiddleware([\Illuminate\Session\Middleware\StartSession::class]);
