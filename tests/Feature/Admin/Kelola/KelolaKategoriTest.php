<?php

namespace Tests\Feature\Admin\Kelola;

use App\Models\Kategori;
use App\Models\Khodam;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pengujian Kelola Kategori oleh Admin
 *
 * Skenario yang diuji:
 * 1. Admin dapat melihat daftar dan mencari kategori.
 * 2. Admin dapat menambah kategori (dengan validasi).
 * 3. Admin dapat melihat detail, memperbarui, dan menghapus kategori.
 * 4. Kategori yang masih dipakai khodam tidak dapat dihapus.
 * 5. Autentikasi: tamu ditolak (401), pengamal ditolak (403).
 *
 * @group kelola-kategori
 */
class KelolaKategoriTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/v1/admin/kelola/kategori';

    private User $admin;

    private User $pengamal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->pengamal = User::factory()->create(['role' => 'pengamal']);
    }

    private function buatKategori(string $nama = 'Penjaga Rumah', string $deskripsi = 'Entitas penjaga rumah.'): Kategori
    {
        return Kategori::create(['nama' => $nama, 'deskripsi' => $deskripsi]);
    }

    /** 1. Admin bisa mengambil daftar kategori */
    public function test_admin_bisa_mengambil_daftar_kategori(): void
    {
        $this->buatKategori('Penjaga Rumah');
        $this->buatKategori('Kewibawaan', 'Meningkatkan wibawa.');

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(200)
            ->assertJsonPath('message', 'Daftar kategori')
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure(['message', 'data' => ['*' => ['id', 'nama', 'deskripsi']]]);
    }

    /** 2. Pencarian kategori berdasarkan nama */
    public function test_admin_bisa_mencari_kategori(): void
    {
        $this->buatKategori('Penjaga Rumah');
        $this->buatKategori('Kewibawaan', 'Meningkatkan wibawa.');

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL.'?search=Wibawa')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.nama', 'Kewibawaan');
    }

    /** 3. Admin bisa menambah kategori */
    public function test_admin_bisa_menambah_kategori(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson(self::URL, [
                'nama' => 'Pelindung Diri',
                'deskripsi' => 'Entitas pelindung diri.',
            ])
            ->assertStatus(201)
            ->assertJsonPath('message', 'Kategori berhasil ditambahkan')
            ->assertJsonPath('data.nama', 'Pelindung Diri');

        $this->assertDatabaseHas('kategoris', ['nama' => 'Pelindung Diri']);
    }

    /** 4. Validasi gagal saat menambah kategori tanpa data */
    public function test_tambah_kategori_gagal_validasi(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->postJson(self::URL, [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nama', 'deskripsi']);
    }

    /** 5. Admin bisa melihat detail kategori */
    public function test_admin_bisa_melihat_detail_kategori(): void
    {
        $kategori = $this->buatKategori();

        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL."/{$kategori->id}")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Detail kategori')
            ->assertJsonPath('data.id', $kategori->id);
    }

    /** 6. Detail kategori tidak ditemukan */
    public function test_detail_kategori_tidak_ditemukan(): void
    {
        $this->actingAs($this->admin, 'sanctum')
            ->getJson(self::URL.'/9999')
            ->assertStatus(404);
    }

    /** 7. Admin bisa memperbarui kategori */
    public function test_admin_bisa_memperbarui_kategori(): void
    {
        $kategori = $this->buatKategori();

        $this->actingAs($this->admin, 'sanctum')
            ->postJson(self::URL."/{$kategori->id}", [
                'nama' => 'Nama Baru',
                'deskripsi' => 'Deskripsi baru.',
            ])
            ->assertStatus(200)
            ->assertJsonPath('message', 'Kategori berhasil diperbarui')
            ->assertJsonPath('data.nama', 'Nama Baru');

        $this->assertDatabaseHas('kategoris', [
            'id' => $kategori->id,
            'nama' => 'Nama Baru',
            'deskripsi' => 'Deskripsi baru.',
        ]);
    }

    /** 8. Validasi gagal saat memperbarui kategori */
    public function test_update_kategori_gagal_validasi(): void
    {
        $kategori = $this->buatKategori();

        $this->actingAs($this->admin, 'sanctum')
            ->postJson(self::URL."/{$kategori->id}", ['nama' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nama', 'deskripsi']);
    }

    /** 9. Admin bisa menghapus kategori yang tidak dipakai */
    public function test_admin_bisa_menghapus_kategori(): void
    {
        $kategori = $this->buatKategori();

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson(self::URL."/{$kategori->id}")
            ->assertStatus(200)
            ->assertJsonPath('message', 'Kategori berhasil dihapus');

        $this->assertDatabaseMissing('kategoris', ['id' => $kategori->id]);
    }

    /** 10. Kategori yang dipakai khodam tidak bisa dihapus */
    public function test_kategori_yang_dipakai_khodam_tidak_bisa_dihapus(): void
    {
        $kategori = $this->buatKategori();
        $khodam = Khodam::create([
            'kode_khodam' => 'KHD-MCP-001',
            'nama' => 'Macan Putih',
            'asal' => 'Alas Purwo',
            'level_kekuatan' => 4,
            'deskripsi' => 'Khodam pelindung gaib.',
        ]);
        $khodam->kategoris()->attach($kategori->id);

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson(self::URL."/{$kategori->id}")
            ->assertStatus(400)
            ->assertJsonPath('message', 'Kategori tidak dapat dihapus karena masih digunakan oleh khodam');

        $this->assertDatabaseHas('kategoris', ['id' => $kategori->id]);
    }

    /** 11. Pengamal dilarang mengakses kelola kategori */
    public function test_pengamal_ditolak_mengakses_kelola_kategori(): void
    {
        $this->actingAs($this->pengamal, 'sanctum')
            ->getJson(self::URL)
            ->assertStatus(403);
    }

    /** 12. Tamu tanpa autentikasi ditolak */
    public function test_tamu_tanpa_autentikasi_ditolak(): void
    {
        $this->getJson(self::URL)->assertStatus(401);
    }
}
