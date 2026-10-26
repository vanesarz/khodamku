<?php

namespace App\Support;

use Carbon\Carbon;

/**
 * Satu-satunya tempat perhitungan selisih hari terhadap jatuh tempo
 * dan teks badge status ("Telat X hari" / "Hari ini" / "X hari lagi").
 */
class StatusJatuhTempo
{
    /**
     * Jumlah hari terlambat; 0 jika belum melewati jatuh tempo.
     */
    public static function hariTerlambat(Carbon $jatuhTempo, Carbon $tanggal): int
    {
        $selisih = self::selisihHari($jatuhTempo, $tanggal);

        return $selisih < 0 ? abs($selisih) : 0;
    }

    /**
     * Teks badge status berdasarkan posisi $tanggal terhadap jatuh tempo.
     */
    public static function badge(Carbon $jatuhTempo, Carbon $tanggal): string
    {
        $selisih = self::selisihHari($jatuhTempo, $tanggal);

        return match (true) {
            $selisih < 0 => 'Telat '.abs($selisih).' hari',
            $selisih === 0 => 'Hari ini',
            default => $selisih.' hari lagi',
        };
    }

    /**
     * Sisa hari menuju jatuh tempo (negatif berarti sudah lewat), dihitung per tanggal.
     */
    private static function selisihHari(Carbon $jatuhTempo, Carbon $tanggal): int
    {
        return (int) $tanggal->copy()->startOfDay()->diffInDays($jatuhTempo->copy()->startOfDay(), false);
    }
}
