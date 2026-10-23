<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    private array $payload = [
        'name' => 'Admin Baru',
        'email' => 'admin.baru@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ];

    public function test_admin_can_create_another_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/users', $this->payload)
            ->assertCreated()
            ->assertJsonPath('message', 'Akun admin baru berhasil dibuat')
            ->assertJsonPath('data.role', 'admin');

        $this->assertDatabaseHas('users', ['email' => 'admin.baru@example.com', 'role' => 'admin']);
    }

    public function test_non_admin_can_not_create_admin(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'pengamal']));

        $this->postJson('/api/v1/admin/users', $this->payload)->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'admin.baru@example.com']);
    }

    public function test_guest_can_not_create_admin(): void
    {
        $this->postJson('/api/v1/admin/users', $this->payload)->assertUnauthorized();
    }
}
