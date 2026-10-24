<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Akun Admin
        // $admin = User::updateOrCreate(
        //     ['email' => 'admin@khodamku.test'],
        //     [
        //         'name' => 'Mbah Darmo',
        //         'password' => Hash::make('password123'),
        //         'role' => 'admin',
        //     ]
        // );

        // $admin->profile()->updateOrCreate(
        //     ['user_id' => $admin->id],
        //     [
        //         'no_hp' => '081299990001',
        //         'alamat' => 'Padepokan KhodamKu, Gunung Salak',
        //         'tanggal_lahir' => '1970-01-01',
        //         'weton' => 'Kliwon',
        //     ]
        // );

        // 2. Akun Pengamal
        $pengamals = [
            [
                'name' => 'Sekar Ayu Lestari',
                'email' => 'sekar@khodamku.test',
                'no_hp' => '081234567801',
                'alamat' => 'Jl. Kenanga No. 12, Sleman',
                'tanggal_lahir' => '1998-04-14',
                'weton' => 'Legi',
            ],
            [
                'name' => 'Bima Saputra',
                'email' => 'bima@khodamku.test',
                'no_hp' => '081234567802',
                'alamat' => 'Jl. Pahlawan No. 45, Solo',
                'tanggal_lahir' => '1995-08-20',
                'weton' => 'Wage',
            ],
            [
                'name' => 'Raka Pratama',
                'email' => 'raka@khodamku.test',
                'no_hp' => '081234567803',
                'alamat' => 'Jl. Riau No. 88, Bandung',
                'tanggal_lahir' => '1997-12-05',
                'weton' => 'Pon',
            ],
        ];

        foreach ($pengamals as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password123'),
                    'role' => 'pengamal',
                ]
            );

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'no_hp' => $data['no_hp'],
                    'alamat' => $data['alamat'],
                    'tanggal_lahir' => $data['tanggal_lahir'],
                    'weton' => $data['weton'],
                ]
            );
        }
    }
}