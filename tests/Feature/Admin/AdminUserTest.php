<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
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

        $this->getJson(self::URL.'?role=pengamal')
            ->assertOk()
            ->assertJsonPath('data.total', 2);
    }

    public function test_admin_can_search_users(): void
    {
        $this->loginAdmin();
        User::factory()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com', 'role' => 'pengamal']);

        $this->getJson(self::URL.'?search=Santoso')
            ->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.email', 'budi@example.com');
    }

    public function test_admin_can_view_user_detail(): void
    {
        $this->loginAdmin();
        $user = User::factory()->create(['role' => 'pengamal']);

        $this->getJson(self::URL."/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Detail user')
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_view_user_detail_not_found(): void
    {
        $this->loginAdmin();

        $this->getJson(self::URL.'/9999')->assertNotFound();
    }

    public function test_admin_can_delete_user(): void
    {
        $this->loginAdmin();
        $user = User::factory()->create(['role' => 'pengamal']);

        $this->deleteJson(self::URL."/{$user->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Akun user berhasil dihapus');

        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_delete_user_not_found(): void
    {
        $this->loginAdmin();

        $this->deleteJson(self::URL.'/9999')->assertNotFound();
    }

    public function test_create_user_fails_when_role_is_invalid(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL, array_merge($this->payload, ['role' => 'superadmin']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['role']);

        $this->assertDatabaseMissing('users', ['email' => 'admin.baru@example.com']);
    }

    private function createPengamalWithProfile(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge([
            'name' => 'Budi Lama',
            'email' => 'budi.lama@example.com',
            'role' => 'pengamal',
        ], $attributes));

        $user->profile()->create([
            'no_hp' => '081111111111',
            'alamat' => 'Alamat Lama',
            'weton' => 'Legi',
        ]);

        return $user;
    }

    public function test_admin_can_update_user_and_profile(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'budi.baru@example.com',
            'password' => 'sandibaru123',
            'no_hp' => '082222222222',
            'alamat' => 'Alamat Baru',
        ])
            ->assertOk()
            ->assertJsonPath('message', 'Data user berhasil diperbarui')
            ->assertJsonPath('data.name', 'Budi Baru')
            ->assertJsonPath('data.profile.no_hp', '082222222222')
            ->assertJsonPath('data.profile.alamat', 'Alamat Baru');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'budi.baru@example.com']);
        $this->assertDatabaseHas('profiles', ['user_id' => $user->id, 'no_hp' => '082222222222', 'weton' => 'Legi']);
        $this->assertTrue(Hash::check('sandibaru123', $user->fresh()->password));
    }

    public function test_update_user_without_password_keeps_old_password(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();
        $passwordLama = $user->password;

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'budi.lama@example.com',
            'password' => null,
        ])->assertOk();

        $this->assertSame($passwordLama, $user->fresh()->password);
    }

    public function test_update_user_keeps_profile_fields_that_are_not_sent(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'budi.lama@example.com',
        ])->assertOk();

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'no_hp' => '081111111111',
            'alamat' => 'Alamat Lama',
        ]);
    }

    public function test_update_user_can_keep_its_own_email(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'budi.lama@example.com',
        ])->assertOk();
    }

    public function test_update_user_fails_when_email_already_used_by_another_user(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();
        User::factory()->create(['email' => 'dipakai@example.com']);

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'dipakai@example.com',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);

        $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'budi.lama@example.com']);
    }

    public function test_update_user_validation_fails(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();

        $this->postJson(self::URL."/{$user->id}", ['password' => 'pendek'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_update_user_can_not_change_role(): void
    {
        $this->loginAdmin();
        $user = $this->createPengamalWithProfile();

        $this->postJson(self::URL."/{$user->id}", [
            'name' => 'Budi Baru',
            'email' => 'budi.lama@example.com',
            'role' => 'admin',
        ])->assertOk();

        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'pengamal']);
    }

    public function test_update_user_not_found(): void
    {
        $this->loginAdmin();

        $this->postJson(self::URL.'/9999', [
            'name' => 'Budi Baru',
            'email' => 'budi.baru@example.com',
        ])->assertNotFound();
    }

    public function test_non_admin_can_not_update_user(): void
    {
        $pengamal = User::factory()->create(['role' => 'pengamal']);
        $target = $this->createPengamalWithProfile();
        Sanctum::actingAs($pengamal);

        $this->postJson(self::URL."/{$target->id}", [
            'name' => 'Diretas',
            'email' => 'diretas@example.com',
        ])->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => 'Budi Lama']);
    }

    public function test_non_admin_can_not_access_user_management(): void
    {
        $pengamal = User::factory()->create(['role' => 'pengamal']);
        $target = User::factory()->create(['role' => 'pengamal']);
        Sanctum::actingAs($pengamal);

        $this->getJson(self::URL)->assertForbidden();
        $this->getJson(self::URL."/{$target->id}")->assertForbidden();
        $this->postJson(self::URL, $this->payload)->assertForbidden();
        $this->deleteJson(self::URL."/{$target->id}")->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'admin.baru@example.com']);
        $this->assertDatabaseHas('users', ['id' => $target->id]);
    }

    public function test_guest_can_not_access_user_management(): void
    {
        $this->getJson(self::URL)->assertUnauthorized();
        $this->postJson(self::URL, $this->payload)->assertUnauthorized();
    }
}
