<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@khodamku.test'],
            [
                'name' => 'Admin 1',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // Profil Admin
        $admin->profile()->updateOrCreate(
            ['user_id' => $admin->id],
            [
                'no_hp' => '08123456789',
                'alamat' => 'Kantor Pusat KhodamKu',
                'tanggal_lahir' => '1945-01-01',
                'weton' => 'Wage',
                'foto' => null,
            ]
        );
    }
}