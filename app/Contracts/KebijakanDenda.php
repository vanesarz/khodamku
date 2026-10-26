<?php

namespace App\Contracts;

use Carbon\Carbon;

/**
 * Interface: kontrak perhitungan mahar denda keterlambatan.
 *
 * Kode pemakai (service, controller) hanya bergantung pada interface ini,
 * bukan pada kelas konkretnya. Implementasi mana yang dipakai ditentukan
 * lewat binding di AppServiceProvider, jadi aturan denda bisa diganti
 * tanpa mengubah kode pemakai (polymorphism).
 */
interface KebijakanDenda
{
    /**
     * Hitung mahar denda (rupiah) untuk pengembalian pada $tanggalKembali.
     */
    public function hitung(Carbon $jatuhTempo, Carbon $tanggalKembali): int;
}
