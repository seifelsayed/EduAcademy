<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Models live under Infrastructure, so the default
        // "Database\Factories\{Model}Factory" guess needs remapping.
        Factory::guessFactoryNamesUsing(
            static fn (string $modelName): string => 'Database\\Factories\\'.class_basename($modelName).'Factory'
        );

        Factory::guessModelNamesUsing(
            static fn (Factory $factory): string => 'App\\Infrastructure\\Persistence\\Eloquent\\Models\\'
                .str_replace('Factory', '', class_basename($factory))
        );

        // Surface mass-assignment mistakes during development rather than
        // silently dropping the attribute. Lazy loading stays enabled: several
        // use-cases deliberately traverse relations on a single aggregate.
        Model::preventSilentlyDiscardingAttributes(! $this->app->isProduction());

        if ($this->app->isProduction()) {
            URL::forceScheme('https');
        }
    }
}
