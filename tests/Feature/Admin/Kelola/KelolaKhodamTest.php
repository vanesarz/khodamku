<?php

namespace Tests\Feature\Admin\Kelola;

use App\Models\Kategori;
use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Pengujian Kelola Khodam oleh Admin
 *
 * Skenario yang diuji:
 * 1. Admin dapat mengakses halaman daftar khodam.
 * 2. Admin dapat menambah khodam baru disertai relasi kategori dan upload foto.
 * 3. Admin dapat melihat detail satu entitas khodam.
 * 4. Admin dapat memperbarui data khodam yang sudah ada.
 * 5. Admin dapat menghapus khodam, dengan validasi khusus khodam yang sedang bersemayam.
 * 6. Autentikasi: Admin wajib login; pengamal dilarang mengakses endpoint ini.
 *
 * @group kelola-khodam
 */
class KelolaKhodamTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $pengamal;

    private Kategori $kategori1;

    private Kategori $kategori2;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Siapkan akun Admin dan Pengamal
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->pengamal = User::factory()->create(['role' => 'pengamal']);

        // 2. Siapkan kategori master untuk relasi many-to-many
        $this->kategori1 = Kategori::create([
            'nama' => 'Penjaga Rumah',
            'deskripsi' => 'Entitas penjaga pelindung rumah.',
        ]);

        $this->kategori2 = Kategori::create([
            'nama' => 'Kewibawaan',
            'deskripsi' => 'Meningkatkan karisma dan wibawa.',
        ]);
    }

    /** 1. Admin bisa mengambil daftar seluruh khodam */
    public function test_admin_bisa_mengambil_daftar_khodam(): void
    {
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Khodam pelindung gaib.',
        ]);
        $khodam->kategoris()->attach([$this->kategori1->id, $this->kategori2->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/khodam');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'kode_khodam',
                        'nama',
                        'asal',
                        'level_kekuatan',
                        'deskripsi',
                        'foto',
                        'status',
                        'is_tersedia',
                        'kategoris' => [
                            '*' => ['id', 'nama'],
                        ],
                    ],
                ],
            ])
            ->assertJsonPath('data.0.status', 'Menunggu Dipanggil')
            ->assertJsonPath('data.0.is_tersedia', true);
    }

    /** 2. Filter pencarian dan status ketersediaan berfungsi */
    public function test_filter_pencarian_dan_ketersediaan_khodam(): void
    {
        $khodam1 = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Sosok penjaga.',
        ]);

        $khodam2 = Khodam::create([
            'kode_khodam' => 'KHD-NGH-001',
            'nama' => 'Naga Hijau',
            'asal' => 'Gunung Lawu',
            'level_kekuatan' => 5,
            'deskripsi' => 'Aura kemakmuran.',
        ]);

        // Simulasikan khodam1 sedang bersemayam (dipinjam secara aktif)
        Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $khodam1->id,
            'tgl_panggil' => Carbon::today()->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(5)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        // Uji filter toggle hanya yang tersedia
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/khodam?hanya_tersedia=true');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.kode_khodam', 'KHD-NGH-001');

        // Uji filter kata kunci pencarian
        $searchResponse = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/khodam?search=Macan');

        $searchResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'Sedang Bersemayam')
            ->assertJsonPath('data.0.is_tersedia', false);
    }

    /** 3. Admin berhasil menambah khodam baru beserta relasi kategori dan foto */
    public function test_admin_bisa_menambah_khodam_baru(): void
    {
        $disk = Storage::fake('public');

        $payload = [
            'kode_khodam' => 'KHD-GRD-001',
            'nama' => 'Garuda Sakti',
            'asal' => 'Puncak Semeru',
            'level_kekuatan' => 5,
            'deskripsi' => 'Entitas langit tingkat tinggi.',
            'kategori_ids' => [$this->kategori1->id, $this->kategori2->id],
            'foto' => UploadedFile::fake()->image('garuda.png', 500, 500),
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/khodam', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.kode_khodam', 'KHD-GRD-001')
            ->assertJsonPath('data.nama', 'Garuda Sakti');

        // Verifikasi data di tabel khodams dan pivot kategori_khodam
        $this->assertDatabaseHas('khodams', [
            'kode_khodam' => 'KHD-GRD-001',
            'nama' => 'Garuda Sakti',
        ]);

        $this->assertDatabaseHas('kategori_khodam', [
            'kategori_id' => $this->kategori1->id,
        ]);

        // Verifikasi berkas gambar tersimpan di storage
        $khodam = Khodam::where('kode_khodam', 'KHD-GRD-001')->first();
        $disk->assertExists($khodam->foto);
    }

    /** 4. Admin bisa melihat detail satu khodam */
    public function test_admin_bisa_melihat_detail_khodam(): void
    {
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Penjaga gaib.',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/khodam/{$khodam->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $khodam->id)
            ->assertJsonPath('data.kode_khodam', 'KHD-MCP-001');
    }

    /** 5. Admin bisa mengubah data khodam */
    public function test_admin_bisa_memperbarui_khodam(): void
    {
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-OLD-001',
            'nama' => 'Nama Lama',
            'asal' => 'Asal Lama',
            'level_kekuatan' => 2,
            'deskripsi' => 'Deskripsi lama.',
        ]);

        $payload = [
            'kode_khodam' => 'KHD-NEW-001',
            'nama' => 'Nama Baru',
            'asal' => 'Asal Baru',
            'level_kekuatan' => 4,
            'deskripsi' => 'Deskripsi telah diperbarui.',
            'kategori_ids' => [$this->kategori1->id],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson("/api/v1/admin/khodam/{$khodam->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.nama', 'Nama Baru')
            ->assertJsonPath('data.kode_khodam', 'KHD-NEW-001');

        $this->assertDatabaseHas('khodams', [
            'id' => $khodam->id,
            'kode_khodam' => 'KHD-NEW-001',
            'nama' => 'Nama Baru',
        ]);
    }

    /** 6. Khodam yang sedang bersemayam ditolak saat akan dihapus */
    public function test_khodam_sedang_bersemayam_tidak_bisa_dihapus(): void
    {
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Sosok penjaga.',
        ]);

        // Buat pemanggilan aktif
        Pemanggilan::create([
            'user_id' => $this->pengamal->id,
            'khodam_id' => $khodam->id,
            'tgl_panggil' => Carbon::today()->toDateString(),
            'tgl_jatuh_tempo' => Carbon::today()->addDays(5)->toDateString(),
            'status' => 'aktif',
            'mahar' => 0,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/khodam/{$khodam->id}");

        // Wajib mengembalikan 422 Unprocessable Content
        $response->assertStatus(422)
            ->assertJsonPath('message', 'Khodam tidak dapat dihapus karena sedang bersemayam pada raga pengamal.');

        // Pastikan entitas khodam masih ada di database
        $this->assertDatabaseHas('khodams', [
            'id' => $khodam->id,
        ]);
    }

    /** 7. Khodam yang tersedia berhasil dihapus dan relasi pivot terlepas */
    public function test_admin_bisa_menghapus_khodam_yang_tersedia(): void
    {
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-DEL-001',
            'nama' => 'Khodam Hapus',
            'asal' => 'Tempat Antah',
            'level_kekuatan' => 1,
            'deskripsi' => 'Unit uji coba hapus.',
        ]);
        $khodam->kategoris()->attach([$this->kategori1->id]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/admin/khodam/{$khodam->id}");

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Khodam berhasil dihapus');

        $this->assertDatabaseMissing('khodams', [
            'id' => $khodam->id,
        ]);

        $this->assertDatabaseMissing('kategori_khodam', [
            'khodam_id' => $khodam->id,
        ]);
    }

    /** 8. Pengamal dilarang mengakses modul kelola khodam admin */
    public function test_pengamal_ditolak_mengakses_kelola_khodam(): void
    {
        $response = $this->actingAs($this->pengamal, 'sanctum')
            ->getJson('/api/v1/admin/khodam');

        $response->assertStatus(403);
    }

    /** 9. Request tanpa token autentikasi ditolak */
    public function test_tamu_tanpa_autentikasi_ditolak(): void
    {
        $response = $this->getJson('/api/v1/admin/khodam');

        $response->assertStatus(401);
    }
}
