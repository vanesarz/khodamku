<?php

namespace Tests\Feature\Admin;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPemanggilanTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $pengamal;
    private Khodam $khodam;

    protected function setUp(): void
    {
        parent::setUp();

        // Siapkan akun admin dan pengamal untuk pengujian
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->pengamal = User::factory()->create(['role' => 'pengamal']);

        $this->khodam = Khodam::create([
            'kode_khodam' => 'KHD-TEST-001',
            'nama' => 'Macan Uji',
            'asal' => 'Hutan Larangan',
            'level_kekuatan' => 4,
            'deskripsi' => 'Khodam untuk pengujian otomatis.',
        ]);
    }

    /** 1. Admin bisa mengambil daftar pemanggilan aktif */
    public function test_admin_bisa_mengambil_daftar_pemanggilan_aktif(): void
    {
        Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $this->khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(2)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(3)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/pemanggilan/aktif');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'tabs' => ['semua', 'terlambat', 'masih_berjalan'],
                'data' => [
                    '*' => [
                        'id',
                        'kode_transaksi',
                        'pengamal',
                        'khodam' => ['nama', 'kode_khodam'],
                        'tgl_panggil',
                        'tgl_jatuh_tempo',
                        'status_badge',
                        'estimasi_mahar',
                        'is_terlambat',
                    ],
                ],
            ]);
    }

    /** 2. Tab filter terlambat dan estimasi mahar denda dihitung tepat */
    public function test_filter_tab_terlambat_dan_kalkulasi_estimasi_mahar(): void
    {
        // Kontrak terlambat 3 hari (Jatuh tempo 3 hari yang lalu)
        Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $this->khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(8)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(3)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/pemanggilan/aktif?tab=terlambat');

        $response->assertStatus(200)
            ->assertJsonPath('tabs.terlambat', 1)
            ->assertJsonPath('data.0.status_badge', 'Telat 3 hari')
            ->assertJsonPath('data.0.estimasi_mahar', 15000)
            ->assertJsonPath('data.0.is_terlambat', true);
    }

    /** 3. Admin berhasil memproses pelepasan khodam dengan denda keterlambatan */
    public function test_admin_bisa_melepas_khodam_terlambat_dan_denda_terkunci(): void
    {
        $pemanggilan = Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $this->khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(7)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(2)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/pemanggilan/{$pemanggilan->id}/lepas");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'dilepas')
            ->assertJsonPath('data.hari_terlambat', 2)
            ->assertJsonPath('data.mahar_akhir', 10000);

        // Verifikasi database
        $this->assertDatabaseHas('pemanggilans', [
            'id' => $pemanggilan->id,
            'status' => 'dilepas',
            'mahar' => 10000,
            'tgl_pelepasan' => Carbon::today()->toDateString(),
        ]);
    }

    /** 4. Admin melepas khodam tepat waktu tanpa mahar denda */
    public function test_admin_melepas_khodam_tepat_waktu_tanpa_denda(): void
    {
        $pemanggilan = Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $this->khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(1)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(4)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/pemanggilan/{$pemanggilan->id}/lepas");

        $response->assertStatus(200)
            ->assertJsonPath('data.hari_terlambat', 0)
            ->assertJsonPath('data.mahar_akhir', 0);
    }

    /** 5. Melepas transaksi yang sudah dilepas mengembalikan 404 */
    public function test_melepas_transaksi_yang_sudah_dilepas_gagal_404(): void
    {
        $pemanggilan = Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $this->khodam->id,
            'tgl_panggil' => Carbon::today()->subDays(5)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->toDateString(),
            'tgl_pelepasan' => Carbon::today()->toDateString(),
            'status' => 'dilepas',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/pemanggilan/{$pemanggilan->id}/lepas");

        $response->assertStatus(404);
    }

    /** 6. Pengamal dilarang mengakses endpoint operasional pemanggilan admin */
    public function test_pengamal_ditolak_akses_pemanggilan_aktif(): void
    {
        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/admin/pemanggilan/aktif');

        $response->assertStatus(403);
    }

    /** 7. Akses tanpa login ditolak 401 */
    public function test_unauthenticated_ditolak(): void
    {
        $response = $this->getJson('/api/v1/admin/pemanggilan/aktif');

        $response->assertStatus(401);
    }
}