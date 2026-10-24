<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminPemanggilanController;
use App\Http\Controllers\Admin\AdminBukuCatatanGaibController;
use App\Http\Controllers\Admin\Kelola\KhodamController;
use App\Http\Controllers\Admin\Kelola\KategoriController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Route khusus Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // Kelola User
        Route::post('/users', [AdminUserController::class, 'store']);

        // Kelola Pemanggilan
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