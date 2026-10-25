<?php

namespace Tests\Feature\Pengamal;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengujian Riwayat Pemanggilan milik Pengamal
 *
 * Skenario yang diuji:
 * 1. Pengamal hanya melihat riwayat miliknya sendiri.
 * 2. Struktur respons, ringkasan, dan urutan terbaru.
 * 3. Filter status (aktif, terlambat, dilepas).
 * 4. Filter rentang tanggal.
 * 5. Perhitungan mahar (terlambat dan dilepas).
 * 6. Tamu tanpa autentikasi ditolak.
 *
 * @group riwayat
 */
class PengamalTest extends TestCase
{
    use RefreshDatabase;

    private User $pengamal;
    private User $lain;
    private Khodam $khodam1;
    private Khodam $khodam2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pengamal = User::factory()->create(['role' => 'pengamal']);
        $this->lain = User::factory()->create(['role' => 'pengamal']);

        $this->khodam1 = Khodam::create([
            'kode_khodam' => 'KHD-NGH-001',
            'nama' => 'Naga Hijau',
            'asal' => 'Gunung Lawu',
            'level_kekuatan' => 5,
            'deskripsi' => 'Aura kemakmuran.',
        ]);

        $this->khodam2 = Khodam::create([
            'kode_khodam' => 'KHD-MCP-002',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Sosok penjaga.',
        ]);
    }

    private function buatPemanggilan(User $user, Khodam $khodam, array $override = []): Pemanggilan
    {
        return Pemanggilan::create(array_merge([
            'user_id' => $user->id,
            'khodam_id' => $khodam->id,
            'tgl_panggil' => Carbon::today()->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(5)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ], $override));
    }

    /** 1. Hanya riwayat milik user yang login */
    public function test_riwayat_hanya_milik_user_sendiri(): void
    {
        $milik = $this->buatPemanggilan($this->pengamal, $this->khodam1);
        $this->buatPemanggilan($this->lain, $this->khodam2);

        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/riwayat');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $milik->id)
            ->assertJsonPath('ringkasan.total_transaksi', 1);
    }

    /** 2. Struktur respons dan urutan terbaru */
    public function test_struktur_respons_dan_urutan_terbaru(): void
    {
        $pertama = $this->buatPemanggilan($this->pengamal, $this->khodam1, [
            'status' => 'dilepas',
            'tgl_pelepasan' => Carbon::today()->toDateString(),
        ]);
        $kedua = $this->buatPemanggilan($this->pengamal, $this->khodam2);

        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/riwayat');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'ringkasan' => ['total_transaksi', 'total_mahar', 'total_mahar_formatted'],
                'filter_options' => ['statuses' => ['*' => ['value', 'label']]],
                'data' => [
                    '*' => [
                        'id',
                        'kode_transaksi',
                        'khodam' => ['nama', 'kode_khodam'],
                        'tgl_panggil',
                        'tgl_panggil_formatted',
                        'tgl_jatuh_tempo',
                        'tgl_jatuh_tempo_formatted',
                        'tgl_pelepasan',
                        'tgl_pelepasan_formatted',
                        'mahar',
                        'mahar_formatted',
                        'status',
                    ],
                ],
            ])
            ->assertJsonPath('data.0.id', $kedua->id)
            ->assertJsonPath('data.1.id', $pertama->id)
            ->assertJsonPath('data.0.kode_transaksi', 'PMG-' . str_pad($kedua->id, 4, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.0.khodam.nama', 'Macan Putih')
            ->assertJsonPath('data.0.tgl_pelepasan_formatted', '—');
    }

    /** 3. Filter status */
    public function test_filter_status(): void
    {
        $aktif = $this->buatPemanggilan($this->pengamal, $this->khodam1);
        $terlambat = $this->buatPemanggilan($this->pengamal, $this->khodam2, [
            'tgl_panggil' => Carbon::today()->subDays(10)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(3)->toDateString(),
        ]);
        $dilepas = $this->buatPemanggilan($this->pengamal, $this->khodam1, [
            'status' => 'dilepas',
            'tgl_pelepasan' => Carbon::today()->toDateString(),
            'mahar' => 10000,
        ]);

        $ids = fn (string $status) => collect(
            $this->actingAs($this->pengamal, 'sanctum')
                ->getJson('/api/v1/riwayat?status=' . $status)
                ->assertStatus(200)
                ->json('data')
        )->pluck('id')->all();

        $this->assertSame([$aktif->id], $ids('aktif'));
        $this->assertSame([$terlambat->id], $ids('terlambat'));
        $this->assertSame([$dilepas->id], $ids('dilepas'));
        $this->assertCount(3, $ids('semua'));
    }

    /** 4. Filter rentang tanggal */
    public function test_filter_rentang_tanggal(): void
    {
        $lama = $this->buatPemanggilan($this->pengamal, $this->khodam1, [
            'tgl_panggil' => '2025-04-05',
            'tgl_jatuh_tempo' => '2025-04-10',
            'status' => 'dilepas',
            'tgl_pelepasan' => '2025-04-12',
        ]);
        $this->buatPemanggilan($this->pengamal, $this->khodam2, [
            'tgl_panggil' => '2025-05-11',
            'tgl_jatuh_tempo' => '2025-05-16',
            'status' => 'dilepas',
            'tgl_pelepasan' => '2025-05-14',
        ]);

        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/riwayat?dari_tanggal=2025-04-01&sampai_tanggal=2025-04-30');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $lama->id);
    }

    /** 5. Perhitungan mahar dan ringkasan */
    public function test_perhitungan_mahar_dan_ringkasan(): void
    {
        // Terlambat 3 hari => 3 x 5000 = 15000
        $this->buatPemanggilan($this->pengamal, $this->khodam1, [
            'tgl_panggil' => Carbon::today()->subDays(10)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(3)->toDateString(),
        ]);
        // Dilepas dengan mahar tersimpan
        $this->buatPemanggilan($this->pengamal, $this->khodam2, [
            'status' => 'dilepas',
            'tgl_pelepasan' => Carbon::today()->toDateString(),
            'mahar' => 10000,
        ]);

        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/riwayat');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.status', 'Dilepas')
            ->assertJsonPath('data.0.mahar', 10000)
            ->assertJsonPath('data.0.mahar_formatted', 'Rp10.000')
            ->assertJsonPath('data.1.status', 'Terlambat')
            ->assertJsonPath('data.1.mahar', 15000)
            ->assertJsonPath('ringkasan.total_transaksi', 2)
            ->assertJsonPath('ringkasan.total_mahar', 25000)
            ->assertJsonPath('ringkasan.total_mahar_formatted', 'Rp25.000');
    }

    /** 6. Tanpa riwayat mengembalikan data kosong */
    public function test_riwayat_kosong(): void
    {
        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/riwayat');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJsonPath('ringkasan.total_transaksi', 0)
            ->assertJsonPath('ringkasan.total_mahar_formatted', 'Rp0');
    }

    /** 7. Tamu tanpa token ditolak */
    public function test_tamu_tanpa_autentikasi_ditolak(): void
    {
        $this->getJson('/api/v1/riwayat')->assertStatus(401);
    }
}
