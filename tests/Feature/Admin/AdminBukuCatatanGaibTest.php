<?php

namespace Tests\Feature\Admin;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminBukuCatatanGaibTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $pengamal1;
    private User $pengamal2;
    private Khodam $khodam1;
    private Khodam $khodam2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->pengamal1 = User::factory()->create([
            'name' => 'Sekar Ayu Lestari',
            'role' => 'pengamal',
        ]);
        $this->pengamal2 = User::factory()->create([
            'name' => 'Bima Saputra',
            'role' => 'pengamal',
        ]);

        $this->khodam1 = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Sosok penjaga gaib.',
        ]);

        $this->khodam2 = Khodam::create([
            'kode_khodam' => 'KHD-NGH-001',
            'nama' => 'Naga Hijau',
            'asal' => 'Telaga Sarangan',
            'level_kekuatan' => 5,
            'deskripsi' => 'Pembawa aura kemakmuran.',
        ]);
    }

    /** 1. Admin berhasil mengambil data Buku Catatan Gaib beserta ringkasan */
    public function test_admin_bisa_mengambil_seluruh_riwayat_buku_catatan_gaib(): void
    {
        Pemanggilan::create([
            'user_id' => $this->pengamal1->id,
            'khodam_id' => $this->khodam1->id,
            'tgl_panggil' => Carbon::today()->subDays(5)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->toDateString(),
            'tgl_pelepasan' => Carbon::today()->toDateString(),
            'status' => 'dilepas',
            'mahar' => 10000,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/buku-catatan-gaib');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'ringkasan' => [
                    'total_transaksi',
                    'total_mahar',
                    'total_mahar_formatted',
                ],
                'filter_options' => [
                    'pengamals',
                    'statuses',
                ],
                'data' => [
                    '*' => [
                        'id',
                        'kode_transaksi',
                        'pengamal',
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
            ->assertJsonPath('ringkasan.total_transaksi', 1)
            ->assertJsonPath('ringkasan.total_mahar', 10000);
    }

    /** 2. Filter berdasarkan Pengamal berfungsi akurat */
    public function test_filter_berdasarkan_pengamal(): void
    {
        Pemanggilan::create([
            'user_id' => $this->pengamal1->id,
            'khodam_id' => $this->khodam1->id,
            'tgl_panggil' => Carbon::today()->subDays(3)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(2)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        Pemanggilan::create([
            'user_id' => $this->pengamal2->id,
            'khodam_id' => $this->khodam2->id,
            'tgl_panggil' => Carbon::today()->subDays(2)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(3)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/buku-catatan-gaib?pengamal_id={$this->pengamal1->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.pengamal', 'Sekar Ayu Lestari');
    }

    /** 3. Filter status terlambat menghitung estimasi mahar denda */
    public function test_filter_status_terlambat_dan_kalkulasi_mahar(): void
    {
        // Transaksi telat 2 hari (jatuh tempo 2 hari lalu)
        Pemanggilan::create([
            'user_id' => $this->pengamal1->id,
            'khodam_id' => $this->khodam1->id,
            'tgl_panggil' => Carbon::today()->subDays(7)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(2)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        // Transaksi aktif masih berjalan tepat waktu
        Pemanggilan::create([
            'user_id' => $this->pengamal2->id,
            'khodam_id' => $this->khodam2->id,
            'tgl_panggil' => Carbon::today()->subDays(1)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(4)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/buku-catatan-gaib?status=terlambat');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'Terlambat')
            ->assertJsonPath('data.0.mahar', 10000)
            ->assertJsonPath('ringkasan.total_mahar', 10000);
    }

    /** 4. Filter status dilepas hanya menampilkan transaksi yang sudah selesai */
    public function test_filter_status_dilepas(): void
    {
        Pemanggilan::create([
            'user_id' => $this->pengamal1->id,
            'khodam_id' => $this->khodam1->id,
            'tgl_panggil' => Carbon::today()->subDays(6)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->subDays(1)->toDateString(),
            'tgl_pelepasan' => Carbon::today()->toDateString(),
            'status' => 'dilepas',
            'mahar' => 5000,
        ]);

        Pemanggilan::create([
            'user_id' => $this->pengamal2->id,
            'khodam_id' => $this->khodam2->id,
            'tgl_panggil' => Carbon::today()->subDays(2)->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(3)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/buku-catatan-gaib?status=dilepas');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'Dilepas')
            ->assertJsonPath('data.0.mahar', 5000);
    }

    /** 5. Filter berdasarkan rentang tanggal pemanggilan */
    public function test_filter_berdasarkan_rentang_tanggal(): void
    {
        Pemanggilan::create([
            'user_id' => $this->pengamal1->id,
            'khodam_id' => $this->khodam1->id,
            'tgl_panggil' => '2025-04-10',
            'tgl_jatuh_tempo' => '2025-04-15',
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        Pemanggilan::create([
            'user_id' => $this->pengamal2->id,
            'khodam_id' => $this->khodam2->id,
            'tgl_panggil' => '2025-05-10',
            'tgl_jatuh_tempo' => '2025-05-15',
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/buku-catatan-gaib?dari_tanggal=2025-05-01&sampai_tanggal=2025-05-31');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.tgl_panggil', '2025-05-10');
    }

    /** 6. Akun Pengamal ditolak mengakses endpoint Buku Catatan Gaib */
    public function test_pengamal_ditolak_mengakses_buku_catatan_gaib(): void
    {
        $response = $this->actingAs($this->pengamal1, 'sanctum')
            ->getJson('/api/v1/admin/buku-catatan-gaib');

        $response->assertStatus(403);
    }

    /** 7. Akses tanpa token autentikasi ditolak */
    public function test_tamu_tanpa_autentikasi_ditolak(): void
    {
        $response = $this->getJson('/api/v1/admin/buku-catatan-gaib');

        $response->assertStatus(401);
    }
}