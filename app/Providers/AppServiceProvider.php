<?php

namespace App\Providers;

use App\Contracts\KebijakanDenda;
use App\Repositories\Contracts\PemanggilanRepositoryInterface;
use App\Repositories\EloquentPemanggilanRepository;
use App\Services\Denda\DendaHarian;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Interface -> implementasi. Ganti DendaHarian dengan DendaTanpaBiaya
        // untuk masa promo; kode pemakai tidak perlu diubah (polymorphism).
        $this->app->bind(KebijakanDenda::class, DendaHarian::class);
        $this->app->bind(PemanggilanRepositoryInterface::class, EloquentPemanggilanRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });
    }
}
