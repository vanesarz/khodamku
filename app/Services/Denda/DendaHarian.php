<?php

namespace App\Services\Denda;

use App\Contracts\KebijakanDenda;
use App\Support\StatusJatuhTempo;
use Carbon\Carbon;

/**
 * Implementasi KebijakanDenda yang dipakai secara default:
 * mahar = jumlah hari terlambat x tarif per hari dari config/khodamku.php.
 */
class DendaHarian implements KebijakanDenda
{
    public function hitung(Carbon $jatuhTempo, Carbon $tanggalKembali): int
    {
        return StatusJatuhTempo::hariTerlambat($jatuhTempo, $tanggalKembali)
            * (int) config('khodamku.tarif_denda_per_hari');
    }
}
