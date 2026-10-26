<?php

namespace App\Services\Denda;

use App\Contracts\KebijakanDenda;
use Carbon\Carbon;

/**
 * Implementasi kedua KebijakanDenda, misalnya untuk masa promo: tidak ada denda.
 *
 * Contoh polymorphism: cukup ganti binding KebijakanDenda di AppServiceProvider
 * ke kelas ini, dan seluruh perhitungan mahar ikut berubah tanpa menyentuh
 * service maupun controller.
 */
class DendaTanpaBiaya implements KebijakanDenda
{
    public function hitung(Carbon $jatuhTempo, Carbon $tanggalKembali): int
    {
        return 0;
    }
}
