<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Admin\AdminPemanggilanController;
use App\Http\Controllers\Admin\AdminBukuCatatanGaibController;
use App\Http\Controllers\Admin\Kelola\KhodamController;
use App\Http\Controllers\Admin\Kelola\KategoriController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Pemanggilan\PemanggilanController;
use App\Http\Controllers\Riwayat\RiwayatController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    Route::get('/khodam', [PemanggilanController::class, 'index']);
    Route::post('/pemanggilan', [PemanggilanController::class, 'store']);
    Route::get('/pemanggilan/aktif', [PemanggilanController::class, 'myActive']);
    Route::get('/riwayat', [RiwayatController::class, 'index']);

    // Route khusus Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/dashboard/statistik', [AdminDashboardController::class, 'statistik']);
        Route::get('/dashboard/jatuh-tempo-terdekat', [AdminDashboardController::class, 'jatuhTempoTerdekat']);
        Route::get('/dashboard/kategori', [AdminDashboardController::class, 'kategori']);
        Route::get('/dashboard/ringkasan', [AdminDashboardController::class, 'ringkasan']);
        

        // Kelola User
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        // Pemanggilan
        Route::get('/pemanggilan/aktif', [AdminPemanggilanController::class, 'index']);
        Route::post('/pemanggilan/{id}/lepas', [AdminPemanggilanController::class, 'lepas']);

        // Buku Catatan Gaib (Riwayat)
        Route::get('/buku-catatan-gaib', [AdminBukuCatatanGaibController::class, 'index']);

        // kelola Khodam
        Route::get('/khodam', [KhodamController::class, 'index']);
        Route::post('/khodam', [KhodamController::class, 'store']);
        Route::get('/khodam/{id}', [KhodamController::class, 'show']);
        Route::post('/khodam/{id}', [KhodamController::class, 'update']);
        Route::delete('/khodam/{id}', [KhodamController::class, 'destroy']);

        // kelola kategori
        Route::get('/kelola/kategori', [KategoriController::class, 'index']);
        Route::post('/kelola/kategori', [KategoriController::class, 'store']);
        Route::get('/kelola/kategori/{id}', [KategoriController::class, 'show']);
        Route::post('/kelola/kategori/{id}', [KategoriController::class, 'update']);
        Route::delete('/kelola/kategori/{id}', [KategoriController::class, 'destroy']);

    });

});