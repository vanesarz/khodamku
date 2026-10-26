<?php

namespace Tests\Unit;

use App\Services\Denda\DendaHarian;
use App\Services\Denda\DendaTanpaBiaya;
use Carbon\Carbon;
use Tests\TestCase;

class DendaHarianTest extends TestCase
{
    public function test_tepat_waktu_tidak_kena_denda(): void
    {
        $jatuhTempo = Carbon::parse('2026-10-10');

        $this->assertSame(0, (new DendaHarian)->hitung($jatuhTempo, Carbon::parse('2026-10-10')));
        $this->assertSame(0, (new DendaHarian)->hitung($jatuhTempo, Carbon::parse('2026-10-08')));
    }

    public function test_telat_dua_hari_kena_denda_sepuluh_ribu(): void
    {
        $this->assertSame(10000, (new DendaHarian)->hitung(
            Carbon::parse('2026-10-10'),
            Carbon::parse('2026-10-12 23:59:00'),
        ));
    }

    public function test_tarif_mengikuti_config(): void
    {
        config(['khodamku.tarif_denda_per_hari' => 7000]);

        $this->assertSame(14000, (new DendaHarian)->hitung(Carbon::parse('2026-10-10'), Carbon::parse('2026-10-12')));
    }

    public function test_denda_tanpa_biaya_selalu_nol(): void
    {
        $this->assertSame(0, (new DendaTanpaBiaya)->hitung(Carbon::parse('2026-10-10'), Carbon::parse('2026-10-20')));
    }
}
