<?php

namespace Tests\Feature\Admin;

use App\Models\Kategori;
use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengujian Dashboard Admin
 *
 * Skenario yang diuji:
 * 1. Endpoint gabungan mengembalikan seluruh data dashboard.
 * 2. Statistik, ringkasan, jatuh tempo terdekat, dan kategori dihitung benar.
 * 3. Endpoint terpisah mengembalikan bagian datanya masing-masing.
 * 4. Autentikasi: tamu ditolak (401), pengamal ditolak (403).
 *
 * @group admin-dashboard
 */
class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/v1/admin/dashboard';

    private User $admin;
    private User $pengamal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->pengamal = User::factory()->create(['role' => 'pengamal', 'name' => 'Sekar Ayu']);
    }

    private function buatKhodam(string $kode, string $nama): Khodam
    {
        return Khodam::create([
            'kode_khodam' => $kode,
            'nama' => $nama,
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 3,
            'deskripsi' => 'Khodam uji.',
        ]);
    }

    private function buatPemanggilan(Khodam $khodam, int $offsetJatuhTempo, string $status = 'aktif', float $mahar = 0): Pemanggilan
    {
        return Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(10)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays($offsetJatuhTempo)->toDateString(),
            'tgl_pelepasan' => $status === 'dilepas' ? Carbon::today()->toDateString() : null,
            'mahar' => $mahar,
            'status' => $status,
        ]);
    }

    /** Data: 3 khodam, 2 pemanggilan aktif (1 telat 3 hari, 1 hari ini), 1 dilepas dengan mahar 20.000 */
    private function siapkanData(): void
    {
        $macan = $this->buatKhodam('KHD-MCP-001', 'Macan Putih');
        $kakek = $this->buatKhodam('KHD-KBJ-001', 'Kakek Berjubah Putih');
        $naga = $this->buatKhodam('KHD-NGH-001', 'Naga Hijau');

        $this->buatPemanggilan($macan, -3);
        $this->buatPemanggilan($kakek, 0);
        $this->buatPemanggilan($naga, 5, 'dilepas', 20000);

        $kategori = Kategori::create(['nama' => 'Penjaga Rumah', 'deskripsi' => 'Penjaga.']);
        Kategori::create(['nama' => 'Kewibawaan', 'deskripsi' => 'Wibawa.']);
        $macan->kategoris()->attach($kategori->id);
        $kakek->kategoris()->attach($kategori->id);
    }

    /** 1. Struktur respons dashboard lengkap */
    public function test_admin_bisa_mengambil_data_dashboard(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonPath('message', 'Data dashboard')
            ->assertJsonStructure([
                'message',
                'data' => [
                    'tanggal',
                    'ringkasan' => ['terlambat', 'estimasi_mahar_terlambat'],
                    'statistik' => [
                        'jumlah_unit', 'menunggu_dipanggil', 'sedang_bersemayam',
                        'pemanggilan_aktif', 'terlambat',
                    ],
                    'jatuh_tempo_terdekat',
                    'kategori',
                    'pengamal_terdaftar',
                    'mahar_terkumpul',
                ],
            ]);
    }

    /** 2. Statistik dihitung dengan benar */
    public function test_statistik_dihitung_dengan_benar(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonPath('data.statistik.jumlah_unit', 3)
            ->assertJsonPath('data.statistik.sedang_bersemayam', 2)
            ->assertJsonPath('data.statistik.menunggu_dipanggil', 1)
            ->assertJsonPath('data.statistik.pemanggilan_aktif', 2)
            ->assertJsonPath('data.statistik.terlambat', 1);
    }

    /** 3. Ringkasan: terlambat, estimasi mahar, pengamal, dan mahar terkumpul */
    public function test_ringkasan_dan_mahar_dihitung_dengan_benar(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonPath('data.ringkasan.terlambat', 1)
            ->assertJsonPath('data.ringkasan.estimasi_mahar_terlambat', 15000)
            ->assertJsonPath('data.pengamal_terdaftar', 1)
            ->assertJsonPath('data.mahar_terkumpul', 20000);
    }

    /** 4. Jatuh tempo terdekat terurut dan memiliki badge yang benar */
    public function test_jatuh_tempo_terdekat_terurut_dengan_badge(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonCount(2, 'data.jatuh_tempo_terdekat')
            ->assertJsonPath('data.jatuh_tempo_terdekat.0.khodam.nama', 'Macan Putih')
            ->assertJsonPath('data.jatuh_tempo_terdekat.0.pengamal', 'Sekar Ayu')
            ->assertJsonPath('data.jatuh_tempo_terdekat.0.status_badge', 'Telat 3 hari')
            ->assertJsonPath('data.jatuh_tempo_terdekat.0.is_terlambat', true)
            ->assertJsonPath('data.jatuh_tempo_terdekat.1.status_badge', 'Hari ini')
            ->assertJsonPath('data.jatuh_tempo_terdekat.1.is_terlambat', false);
    }

    /** 5. Jatuh tempo terdekat dibatasi 4 data */
    public function test_jatuh_tempo_terdekat_dibatasi_empat_data(): void
    {
        foreach (range(1, 6) as $i) {
            $this->buatPemanggilan($this->buatKhodam("KHD-TST-00{$i}", "Khodam {$i}"), $i);
        }

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL . '/jatuh-tempo-terdekat')
            ->assertStatus(200)
            ->assertJsonCount(4, 'data')
            ->assertJsonPath('data.0.status_badge', '1 hari lagi');
    }

    /** 6. Kategori menampilkan jumlah khodam */
    public function test_kategori_menampilkan_jumlah_khodam(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL . '/kategori')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.nama', 'Kewibawaan')
            ->assertJsonPath('data.0.jumlah_khodam', 0)
            ->assertJsonPath('data.1.nama', 'Penjaga Rumah')
            ->assertJsonPath('data.1.jumlah_khodam', 2);
    }

    /** 7. Endpoint statistik terpisah */
    public function test_endpoint_statistik_terpisah(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL . '/statistik')
            ->assertStatus(200)
            ->assertJsonPath('data.jumlah_unit', 3)
            ->assertJsonPath('data.terlambat', 1);
    }

    /** 8. Endpoint ringkasan terpisah */
    public function test_endpoint_ringkasan_terpisah(): void
    {
        $this->siapkanData();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL . '/ringkasan')
            ->assertStatus(200)
            ->assertJsonPath('data.ringkasan.estimasi_mahar_terlambat', 15000)
            ->assertJsonPath('data.pengamal_terdaftar', 1)
            ->assertJsonPath('data.mahar_terkumpul', 20000);
    }

    /** 9. Dashboard kosong tetap berhasil */
    public function test_dashboard_kosong_mengembalikan_nol(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonPath('data.statistik.jumlah_unit', 0)
            ->assertJsonPath('data.statistik.menunggu_dipanggil', 0)
            ->assertJsonCount(0, 'data.jatuh_tempo_terdekat')
            ->assertJsonCount(0, 'data.kategori');
    }

    /** 10. Pengamal dilarang mengakses dashboard admin */
    public function test_pengamal_ditolak_mengakses_dashboard(): void
    {
        foreach (['', '/statistik', '/jatuh-tempo-terdekat', '/kategori', '/ringkasan'] as $path) {
            $this->actingAs($this->pengamal, 'sanctum')
                ->getJson(self::URL . $path)
                ->assertStatus(403);
        }
    }

    /** 11. Tamu tanpa autentikasi ditolak */
    public function test_tamu_tanpa_autentikasi_ditolak(): void
    {
        $this->getJson(self::URL)->assertStatus(401);
    }
}
