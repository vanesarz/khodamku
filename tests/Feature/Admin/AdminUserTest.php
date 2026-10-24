<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/v1/admin/users';

    private array $payload = [
        'name' => 'Admin Baru',
        'email' => 'admin.baru@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ];

    private function loginAdmin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        return $admin;
    }

    public function test_admin_can_create_another_admin(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, $this->payload)
            ->assertCreated()
            ->assertJsonPath('message', 'Akun admin baru berhasil dibuat')
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', ['email' => 'admin.baru@example.com', 'role' => 'admin']);
    }

    public function test_admin_can_create_pengamal(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, array_merge($this->payload, [
            'name' => 'Pengamal Baru',
            'email' => 'pengamal.baru@example.com',
            'role' => 'pengamal',
        ]))
            ->assertCreated()
            ->assertJsonPath('message', 'Akun pengamal baru berhasil dibuat')
            ->assertJsonPath('data.role', 'pengamal');

        $this->assertDatabaseHas('users', ['email' => 'pengamal.baru@example.com', 'role' => 'pengamal']);
    }

    public function test_create_user_also_creates_default_profile(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, $this->payload)
            ->assertCreated()
            ->assertJsonPath('data.profile.no_hp', '-')
            ->assertJsonPath('data.profile.alamat', '-');

        $user = User::where('email', 'admin.baru@example.com')->first();
        $this->assertDatabaseHas('profiles', ['user_id' => $user->id]);
    }

    public function test_create_user_validation_fails(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_create_user_fails_when_email_already_used(): void
    {
        $this->loginAdmin();
        User::factory()->create(['email' => 'admin.baru@example.com']);

        $this->postJson(self::URL, $this->payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_create_user_fails_when_password_not_confirmed(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, array_merge($this->payload, ['password_confirmation' => 'beda']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_admin_can_list_users(): void
    {
        $this->loginAdmin();
        User::factory()->count(3)->create(['role' => 'pengamal']);

        $this->getJson(self::URL)
            ->assertOk()
            ->assertJsonPath('message', 'Daftar user')
            ->assertJsonPath('data.total', 4)
            ->assertJsonStructure(['message', 'data' => ['data' => ['*' => ['id', 'name', 'email', 'role']]]]);
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $this->loginAdmin();
        User::factory()->count(2)->create(['role' => 'pengamal']);

        $this->getJson(self::URL . '?role=pengamal')
            ->assertOk()
            ->assertJsonPath('data.total', 2);
    }

    public function test_admin_can_search_users(): void
    {
        $this->loginAdmin();
        User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com', 'role' => 'pengamal']);

        $this->getJson(self::URL . '?search=Santoso')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.email', 'budi@example.com');
    }

    public function test_admin_can_view_user_detail(): void
    {
        $this->loginAdmin();
        $user = User::factory()->create(['role' => 'pengamal']);

        $this->getJson(self::URL . "/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Detail user')
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_view_user_detail_not_found(): void
    {
        $this->loginAdmin();

        $this->getJson(self::URL . '/9999')->assertNotFound();
    }

    public function test_admin_can_delete_user(): void
    {
        $this->loginAdmin();
        $user = User::factory()->create(['role' => 'pengamal']);

        $this->deleteJson(self::URL . "/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Akun user berhasil dihapus');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_delete_user_not_found(): void
    {
        $this->loginAdmin();

        $this->deleteJson(self::URL . '/9999')->assertNotFound();
    }

    public function test_non_admin_can_not_access_user_management(): void
    {
        $pengamal = User::factory()->create(['role' => 'pengamal']);
        $target = User::factory()->create(['role' => 'pengamal']);
        Sanctum::actingAs($pengamal);

        $this->getJson(self::URL)->assertForbidden();
        $this->getJson(self::URL . "/{$target->id}")->assertForbidden();
        $this->postJson(self::URL, $this->payload)->assertForbidden();
        $this->deleteJson(self::URL . "/{$target->id}")->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'admin.baru@example.com']);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_guest_can_not_access_user_management(): void
    {
        $this->getJson(self::URL)->assertUnauthorized();
        $this->postJson(self::URL, $this->payload)->assertUnauthorized();
    }
}
