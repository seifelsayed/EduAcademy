<?php

declare(strict_types=1);

use App\Domain\Assessment\Enums\AttemptStatus;
use App\Infrastructure\Persistence\Eloquent\Models\QuizAttempt;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function (): void {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Timed quiz attempts that were never submitted would otherwise sit open
| forever and block the learner's remaining attempts.
*/
Artisan::command('quiz:expire-attempts', function (): void {
    $expired = QuizAttempt::query()
        ->where('status', AttemptStatus::InProgress->value)
        ->whereNotNull('expires_at')
        ->where('expires_at', '<', now())
        ->update([
            'status' => AttemptStatus::Abandoned->value,
            'updated_at' => now(),
        ]);

    $this->info("Abandoned {$expired} expired quiz attempt(s).");
})->purpose('Close quiz attempts whose time limit has elapsed');

Schedule::command('quiz:expire-attempts')->everyFifteenMinutes();
