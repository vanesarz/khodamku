<?php

namespace Tests\Feature\Profile;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'pengamal',
        ]);

        $this->user->profile()->create([
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Padepokan No. 1',
            'weton' => 'Senin Pon',
            'tanggal_lahir' => '1995-05-15',
            'foto' => null,
        ]);
    }

    public function test_user_dapat_melihat_profil_sendiri(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->user->id)
            ->assertJsonPath('data.profile.no_hp', '081234567890')
            ->assertJsonPath('data.profile.weton', 'Senin Pon');
    }

    public function test_user_dapat_memperbarui_data_profil_tanpa_foto(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile', [
                'no_hp' => '089876543210',
                'alamat' => 'Jl. Baru Pertapaan No. 7',
                'weton' => 'Jumat Kliwon',
                'tanggal_lahir' => '1996-08-20',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Profil berhasil diperbarui')
            ->assertJsonPath('data.profile.no_hp', '089876543210')
            ->assertJsonPath('data.profile.alamat', 'Jl. Baru Pertapaan No. 7')
            ->assertJsonPath('data.profile.weton', 'Jumat Kliwon');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $this->user->id,
            'no_hp' => '089876543210',
            'alamat' => 'Jl. Baru Pertapaan No. 7',
        ]);
    }

    public function test_user_dapat_mengunggah_foto_profil(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 300, 300);

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/profile', [
                'no_hp' => '081234567890',
                'alamat' => 'Jl. Padepokan No. 1',
                'weton' => 'Senin Pon',
                'foto' => $file,
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(200);

        $fotoPath = $response->json('data.profile.foto');
        $this->assertNotNull($fotoPath);
        Storage::disk('public')->assertExists($fotoPath);

        // Verifikasi bahwa foto_url juga tersedia
        $this->assertNotNull($response->json('data.profile.foto_url'));
        $this->assertStringContainsString('storage/'.$fotoPath, $response->json('data.profile.foto_url'));
    }

    public function test_upload_foto_baru_menghapus_foto_lama(): void
    {
        Storage::fake('public');

        $fotoLama = UploadedFile::fake()->image('lama.jpg')->store('profiles', 'public');
        $this->user->profile()->update(['foto' => $fotoLama]);
        Storage::disk('public')->assertExists($fotoLama);

        $fotoBaru = UploadedFile::fake()->image('baru.png');

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/profile', [
                'no_hp' => '081234567890',
                'alamat' => 'Jl. Padepokan No. 1',
                'weton' => 'Senin Pon',
                'foto' => $fotoBaru,
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(200);
        $fotoBaruPath = $response->json('data.profile.foto');

        // Foto lama terhapus, foto baru ada
        Storage::disk('public')->assertMissing($fotoLama);
        Storage::disk('public')->assertExists($fotoBaruPath);
    }

    public function test_user_dapat_menghapus_foto_profil(): void
    {
        Storage::fake('public');

        $foto = UploadedFile::fake()->image('avatar.jpg')->store('profiles', 'public');
        $this->user->profile()->update(['foto' => $foto]);
        Storage::disk('public')->assertExists($foto);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile', [
                'no_hp' => '081234567890',
                'alamat' => 'Jl. Padepokan No. 1',
                'weton' => 'Senin Pon',
                'hapus_foto' => true,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.profile.foto', null);

        Storage::disk('public')->assertMissing($foto);
        $this->assertDatabaseHas('profiles', [
            'user_id' => $this->user->id,
            'foto' => null,
        ]);
    }

    public function test_validasi_foto_gagal_jika_bukan_gambar(): void
    {
        $file = UploadedFile::fake()->create('dokumen.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->user, 'sanctum')
            ->post('/api/v1/profile', [
                'no_hp' => '081234567890',
                'alamat' => 'Jl. Padepokan No. 1',
                'weton' => 'Senin Pon',
                'foto' => $file,
            ], [
                'Accept' => 'application/json',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['foto']);
    }

    public function test_tamu_tidak_bisa_mengakses_profil(): void
    {
        $response = $this->getJson('/api/v1/profile');
        $response->assertStatus(401);

        $responsePost = $this->postJson('/api/v1/profile', [
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Padepokan No. 1',
            'weton' => 'Senin Pon',
        ]);
        $responsePost->assertStatus(401);
    }

    public function test_user_dapat_mengubah_kata_sandi(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile/password', [
                'current_password' => 'password',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Kata sandi berhasil diperbarui');

        $this->user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $this->user->password));
    }

    public function test_gagal_ubah_kata_sandi_jika_kata_sandi_saat_ini_salah(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile/password', [
                'current_password' => 'passwordsalah',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_gagal_ubah_kata_sandi_jika_konfirmasi_tidak_cocok(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile/password', [
                'current_password' => 'password',
                'password' => 'newpassword123',
                'password_confirmation' => 'berbeda123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_gagal_ubah_kata_sandi_jika_kurang_dari_8_karakter(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/v1/profile/password', [
                'current_password' => 'password',
                'password' => '123',
                'password_confirmation' => '123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_tamu_tidak_bisa_mengubah_kata_sandi(): void
    {
        $response = $this->postJson('/api/v1/profile/password', [
            'current_password' => 'password',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(401);
    }
}
