<?php

declare(strict_types=1);

namespace App\Presentation\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Explains *why* a database connection fails, instead of leaving you with
 * "Connection refused to 127.0.0.1".
 *
 * On a platform like Railway that host almost always means the database
 * environment variables never reached the container, so Laravel fell back to
 * its local defaults. This prints exactly which variables are visible, what the
 * config resolved to, and what to fix.
 */
final class DbDoctorCommand extends Command
{
    protected $signature = 'db:doctor';

    protected $description = 'Diagnose database connectivity and environment configuration';

    /**
     * Variables a managed MySQL add-on may expose, in the order the config reads them.
     *
     * @var array<int, string>
     */
    private const URL_VARS = ['DB_URL', 'MYSQL_URL', 'DATABASE_URL', 'MYSQL_PRIVATE_URL', 'MYSQL_PUBLIC_URL'];

    /**
     * @var array<string, array<int, string>>
     */
    private const PART_VARS = [
        'host' => ['MYSQLHOST', 'MYSQL_HOST', 'DB_HOST'],
        'port' => ['MYSQLPORT', 'MYSQL_PORT', 'DB_PORT'],
        'database' => ['MYSQLDATABASE', 'MYSQL_DATABASE', 'DB_DATABASE'],
        'username' => ['MYSQLUSER', 'MYSQL_USER', 'DB_USERNAME'],
        'password' => ['MYSQLPASSWORD', 'MYSQL_PASSWORD', 'DB_PASSWORD'],
    ];

    public function handle(): int
    {
        $this->components->info('Database diagnostics');

        $this->line('  <fg=gray>APP_ENV</>      '.(string) config('app.env'));
        $this->line('  <fg=gray>DB_CONNECTION</> '.(string) config('database.default'));
        $this->newLine();

        $sawAnyUrl = $this->reportUrlVars();
        $sawAllParts = $this->reportPartVars();

        $this->newLine();
        $this->resolvedConfig();
        $this->newLine();

        if (! $sawAnyUrl && ! $sawAllParts) {
            // Some parts may be set while others are missing, so say "incomplete"
            // rather than claiming nothing was found at all.
            $this->components->error('Database configuration is incomplete — see the missing entries above.');
            $this->explainMissingVars();

            return self::FAILURE;
        }

        return $this->attemptConnection();
    }

    private function reportUrlVars(): bool
    {
        $this->line('  <options=bold>Connection URL variables</>');
        $found = false;

        foreach (self::URL_VARS as $name) {
            $value = env($name);

            if (filled($value)) {
                $found = true;
                $this->line(sprintf('    <fg=green>set</>     %-18s %s', $name, $this->maskUrl((string) $value)));
            } else {
                $this->line(sprintf('    <fg=gray>missing</> %s', $name));
            }
        }

        return $found;
    }

    private function reportPartVars(): bool
    {
        $this->newLine();
        $this->line('  <options=bold>Individual variables</>');
        $complete = true;

        foreach (self::PART_VARS as $part => $names) {
            $hit = null;

            foreach ($names as $name) {
                if (filled(env($name))) {
                    $hit = $name;
                    break;
                }
            }

            if ($hit === null) {
                // A missing password is legitimate; a missing host is not.
                if ($part !== 'password') {
                    $complete = false;
                }

                $this->line(sprintf('    <fg=gray>missing</> %-9s tried: %s', $part, implode(', ', $names)));

                continue;
            }

            $shown = $part === 'password' ? str_repeat('*', 8) : (string) env($hit);
            $this->line(sprintf('    <fg=green>set</>     %-9s %s = %s', $part, $hit, $shown));
        }

        return $complete;
    }

    private function resolvedConfig(): void
    {
        $config = config('database.connections.'.config('database.default'));

        $this->line('  <options=bold>Resolved connection</>');
        $this->line('    host      '.($config['host'] ?? '—'));
        $this->line('    port      '.($config['port'] ?? '—'));
        $this->line('    database  '.($config['database'] ?? '—'));
        $this->line('    username  '.($config['username'] ?? '—'));

        if (($config['host'] ?? null) === '127.0.0.1' && ! app()->environment('local')) {
            $this->newLine();
            $this->components->warn(
                'Host is 127.0.0.1 outside local. That is the built-in fallback, '
                .'which means no database variables reached this container.'
            );
        }
    }

    private function attemptConnection(): int
    {
        // Deliberately not wrapped in components->task(): that would let the
        // PDO exception escape and bury this command's guidance under a stack
        // trace, which is exactly the failure mode it exists to replace.
        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $this->components->error('Could not connect: '.$this->firstLine($e->getMessage()));
            $this->explainMissingVars();

            return self::FAILURE;
        }

        $pending = 0;

        try {
            $pending = count(app('migrator')->getMigrationFiles(database_path('migrations')))
                - count(app('migrator')->getRepository()->getRan());
        } catch (Throwable) {
            $this->components->warn('Connected, but the migrations table is not readable yet. Run: php artisan migrate --force');
        }

        $this->newLine();
        $this->components->info('Connected successfully.');

        if ($pending > 0) {
            $this->components->warn($pending.' migration(s) still pending. Run: php artisan migrate --force');
        }

        return self::SUCCESS;
    }

    private function explainMissingVars(): void
    {
        $this->newLine();
        $this->line('  <options=bold>How to fix on Railway</>');
        $this->line('  1. Open your <options=bold>app</> service → Variables tab.');
        $this->line('  2. Add these, replacing <fg=yellow>MySQL</> with your database service name:');
        $this->newLine();

        foreach ([
            'DB_CONNECTION=mysql',
            'DB_HOST=${{MySQL.MYSQLHOST}}',
            'DB_PORT=${{MySQL.MYSQLPORT}}',
            'DB_DATABASE=${{MySQL.MYSQLDATABASE}}',
            'DB_USERNAME=${{MySQL.MYSQLUSER}}',
            'DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}',
        ] as $line) {
            $this->line('       <fg=cyan>'.$line.'</>');
        }

        $this->newLine();
        $this->line('  3. Redeploy, then run this command again to confirm.');
        $this->newLine();
        $this->line('  <fg=gray>The database service holds those variables; an app service does</>');
        $this->line('  <fg=gray>not inherit them automatically — it has to reference them.</>');
    }

    /** Driver errors are multi-line; the first line carries the useful part. */
    private function firstLine(string $message): string
    {
        return trim(strtok($message, "\n") ?: $message);
    }

    /** Keeps the password out of logs while still showing the host. */
    private function maskUrl(string $url): string
    {
        return (string) preg_replace('#://([^:/@]+):[^@]*@#', '://$1:****@', $url);
    }
}
