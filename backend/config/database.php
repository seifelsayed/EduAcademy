<?php

declare(strict_types=1);

use Illuminate\Support\Str;

$firstNonEmpty = static function (string ...$names): ?string {
    foreach ($names as $name) {
        $val = env($name);
        if ($val !== null && $val !== '') {
            return (string) $val;
        }
    }
    return null;
};

return [
    'default' => env('DB_CONNECTION', 'mysql'),

    'connections' => [

        'sqlite' => [
            'driver' => 'sqlite',
            'url' => $firstNonEmpty('DB_URL', 'DATABASE_URL'),
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
            'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
        ],

        'mysql' => [
            'driver' => 'mysql',
            'url' => $firstNonEmpty('DB_URL', 'MYSQL_URL', 'DATABASE_URL'),
            'host' => $firstNonEmpty('DB_HOST', 'MYSQLHOST', 'MYSQL_HOST') ?? '127.0.0.1',
            'port' => $firstNonEmpty('DB_PORT', 'MYSQLPORT', 'MYSQL_PORT') ?? '3306',
            'database' => $firstNonEmpty('DB_DATABASE', 'MYSQLDATABASE', 'MYSQL_DATABASE') ?? 'education',
            'username' => $firstNonEmpty('DB_USERNAME', 'MYSQLUSER', 'MYSQL_USER') ?? 'root',
            'password' => $firstNonEmpty('DB_PASSWORD', 'MYSQLPASSWORD', 'MYSQL_PASSWORD') ?? '',
            'unix_socket' => $firstNonEmpty('DB_SOCKET') ?? '',
            'charset' => env('DB_CHARSET', 'utf8mb4'),
            'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '',
            'prefix_indexes' => true,
            'strict' => true,
            'engine' => 'InnoDB',
            'options' => extension_loaded('pdo_mysql') ? array_filter([
                PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
            ]) : [],
        ],

    ],

    'migrations' => [
        'table' => 'migrations',
        'update_date_on_publish' => true,
    ],

    'redis' => [
        'client' => env('REDIS_CLIENT', 'phpredis'),

        'options' => [
            'cluster' => env('REDIS_CLUSTER', 'redis'),
            'prefix' => env('REDIS_PREFIX', Str::slug((string) env('APP_NAME', 'laravel'), '_').'_database_'),
        ],

        'default' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_DB', '0'),
        ],

        'cache' => [
            'url' => env('REDIS_URL'),
            'host' => env('REDIS_HOST', '127.0.0.1'),
            'username' => env('REDIS_USERNAME'),
            'password' => env('REDIS_PASSWORD'),
            'port' => env('REDIS_PORT', '6379'),
            'database' => env('REDIS_CACHE_DB', '1'),
        ],
    ],
];
