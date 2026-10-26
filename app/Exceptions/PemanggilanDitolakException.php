<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;

/**
 * Kelas induk untuk penolakan aturan bisnis pemanggilan.
 *
 * Inheritance: subclass cukup menentukan pesan; cara render ke JSON 422
 * diwarisi dari kelas ini. Laravel memanggil render() secara otomatis.
 */
abstract class PemanggilanDitolakException extends Exception implements ShouldntReport
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 422);
    }
}
