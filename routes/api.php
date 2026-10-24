<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Profile\ProfileController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminPemanggilanController;
use App\Http\Controllers\Admin\AdminBukuCatatanGaibController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Route khusus Admin
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/users', [AdminUserController::class, 'store']);

        Route::get('/pemanggilan/aktif', [AdminPemanggilanController::class, 'index']);
        Route::post('/pemanggilan/{id}/lepas', [AdminPemanggilanController::class, 'lepas']);
        Route::get('/buku-catatan-gaib', [AdminBukuCatatanGaibController::class, 'index']);
    });

});