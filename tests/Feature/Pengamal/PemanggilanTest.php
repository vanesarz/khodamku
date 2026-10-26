<?php

namespace Tests\Feature\Pengamal;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PemanggilanTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/v1/pemanggilan';

    private User $pengamal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pengamal = User::factory()->create(['role' => 'pengamal']);
    }

    private function buatKhodam(string $kode): Khodam
    {
        return Khodam::create([
            'kode_khodam' => $kode,
            'nama' => 'Khodam '.$kode,
            'asal' => 'Hutan Larangan',
            'level_kekuatan' => 3,
            'deskripsi' => 'Khodam untuk pengujian otomatis.',
        ]);
    }

    private function buatPemanggilanAktif(User $user, Khodam $khodam, int $offsetJatuhTempo = 5): Pemanggilan
    {
        return Pemanggilan::create([
            'user_id' => $user->id,
            'khodam_id' => $khodam->id,
            'tgl_panggil' => Carbon::today()->addDays($offsetJatuhTempo - 5)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays($offsetJatuhTempo)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);
    }

    public function test_pengamal_bisa_memanggil_khodam_dengan_jatuh_tempo_lima_hari(): void
    {
        $khodam = $this->buatKhodam('KHD-001');

        $this->actingAs($this->pengamal, 'sanctum')
            ->postJson(self::URL, ['khodam_id' => $khodam->id, 'tgl_panggil' => '2026-10-01'])
            ->assertCreated()
            ->assertJsonPath('message', 'Pemanggilan berhasil dilakukan')
            ->assertJsonPath('data.khodam.kode_khodam', 'KHD-001')
            ->assertJsonPath('data.status', 'aktif');

        $this->assertDatabaseHas('pemanggilans', [
            'user_id' => $this->pengamal->id,
            'khodam_id' => $khodam->id,
            'tgl_panggil' => '2026-10-01',
            'tgl_jatuh_tempo' => '2026-10-06',
            'status' => 'aktif',
        ]);
    }

    public function test_pemanggilan_tanpa_tanggal_memakai_hari_ini(): void
    {
        $khodam = $this->buatKhodam('KHD-001');

        $this->actingAs($this->pengamal, 'sanctum')
            ->postJson(self::URL, ['khodam_id' => $khodam->id])
            ->assertCreated();

        $this->assertDatabaseHas('pemanggilans', [
            'khodam_id' => $khodam->id,
            'tgl_panggil' => Carbon::today()->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(5)->toDateString(),
        ]);
    }

    public function test_pemanggilan_ditolak_jika_kuota_raga_penuh(): void
    {
        $this->buatPemanggilanAktif($this->pengamal, $this->buatKhodam('KHD-001'));
        $this->buatPemanggilanAktif($this->pengamal, $this->buatKhodam('KHD-002'));
        $ketiga = $this->buatKhodam('KHD-003');

        $this->actingAs($this->pengamal, 'sanctum')
            ->postJson(self::URL, ['khodam_id' => $ketiga->id])
            ->assertUnprocessable()
            ->assertExactJson([
                'message' => 'Raga Anda hanya kuat menampung maksimal 2 khodam aktif secara bersamaan.',
            ]);

        $this->assertDatabaseMissing('pemanggilans', ['khodam_id' => $ketiga->id]);
    }

    public function test_pemanggilan_ditolak_jika_khodam_sedang_bersemayam(): void
    {
        $khodam = $this->buatKhodam('KHD-001');
        $this->buatPemanggilanAktif(User::factory()->create(['role' => 'pengamal']), $khodam);

        $this->actingAs($this->pengamal, 'sanctum')
            ->postJson(self::URL, ['khodam_id' => $khodam->id])
            ->assertUnprocessable()
            ->assertExactJson([
                'message' => 'Khodam ini sedang bersemayam di raga pengamal lain.',
            ]);

        $this->assertSame(1, Pemanggilan::where('khodam_id', $khodam->id)->count());
    }

    public function test_pemanggilan_validasi_khodam_wajib_ada(): void
    {
        $this->actingAs($this->pengamal, 'sanctum')
            ->postJson(self::URL, ['khodam_id' => 9999])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['khodam_id']);
    }

    public function test_daftar_aktif_menampilkan_badge_mahar_dan_kuota(): void
    {
        $telat = $this->buatPemanggilanAktif($this->pengamal, $this->buatKhodam('KHD-001'), -2);
        $berjalan = $this->buatPemanggilanAktif($this->pengamal, $this->buatKhodam('KHD-002'), 3);

        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson(self::URL.'/aktif')
            ->assertOk()
            ->assertJsonPath('message', 'Daftar pemanggilan aktif Anda berhasil dimuat')
            ->assertJsonPath('kuota_terpakai', 2)
            ->assertJsonPath('kuota_maksimal', 2)
            ->assertJsonPath('data.0.id', $telat->id)
            ->assertJsonPath('data.0.kode_transaksi', 'PMG-'.str_pad($telat->id, 4, '0', STR_PAD_LEFT))
            ->assertJsonPath('data.0.status_badge', 'Telat 2 hari')
            ->assertJsonPath('data.0.estimasi_mahar', 10000)
            ->assertJsonPath('data.0.is_terlambat', true)
            ->assertJsonPath('data.0.khodam.kode_khodam', 'KHD-001')
            ->assertJsonPath('data.1.id', $berjalan->id)
            ->assertJsonPath('data.1.status_badge', '3 hari lagi')
            ->assertJsonPath('data.1.estimasi_mahar', 0)
            ->assertJsonPath('data.1.is_terlambat', false);
    }

    public function test_katalog_khodam_tanpa_per_page_mengembalikan_semua_tanpa_meta(): void
    {
        $this->buatKhodam('KHD-001');
        $this->buatKhodam('KHD-002');

        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/khodam')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonMissingPath('meta');
    }

    public function test_katalog_khodam_dengan_per_page_dipotong_per_halaman(): void
    {
        foreach (['KHD-001', 'KHD-002', 'KHD-003'] as $kode) {
            $this->buatKhodam($kode);
        }

        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/khodam?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.kode_khodam', 'KHD-001')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_katalog_khodam_per_page_tidak_valid_ditolak(): void
    {
        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/khodam?per_page=0')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['per_page']);
    }

    public function test_daftar_aktif_menampilkan_badge_hari_ini(): void
    {
        $this->buatPemanggilanAktif($this->pengamal, $this->buatKhodam('KHD-001'), 0);

        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson(self::URL.'/aktif')
            ->assertOk()
            ->assertJsonPath('data.0.status_badge', 'Hari ini')
            ->assertJsonPath('data.0.estimasi_mahar', 0);
    }
}
