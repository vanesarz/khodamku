<?php

namespace Database\Seeders;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Illuminate\Database\Seeder;

class PemanggilanSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::pluck('id', 'name');
        $khodams = Khodam::pluck('id', 'kode_khodam');

        $transaksi = [
            // --- Transaksi Selesai (Dilepas) ---
            [
                'id' => 1028,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-MCP-002',
                'tgl_panggil' => '2025-04-05',
                'tgl_jatuh_tempo' => '2025-04-10',
                'tgl_pelepasan' => '2025-04-12',
                'mahar' => 10000,
                'status' => 'dilepas',
            ],
            [
                'id' => 1030,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-HRM-001',
                'tgl_panggil' => '2025-04-12',
                'tgl_jatuh_tempo' => '2025-04-17',
                'tgl_pelepasan' => '2025-04-17',
                'mahar' => 0,
                'status' => 'dilepas',
            ],
            [
                'id' => 1033,
                'user_name' => 'Sekar Ayu Lestari',
                'kode_khodam' => 'KHD-KDP-001',
                'tgl_panggil' => '2025-04-18',
                'tgl_jatuh_tempo' => '2025-04-23',
                'tgl_pelepasan' => '2025-04-25',
                'mahar' => 10000,
                'status' => 'dilepas',
            ],
            [
                'id' => 1035,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-TPN-001',
                'tgl_panggil' => '2025-04-20',
                'tgl_jatuh_tempo' => '2025-04-25',
                'tgl_pelepasan' => '2025-04-24',
                'mahar' => 0,
                'status' => 'dilepas',
            ],

            // --- Transaksi Pemanggilan Aktif (Sedang Bersemayam) ---
            [
                'id' => 1039,
                'user_name' => 'Sekar Ayu Lestari',
                'kode_khodam' => 'KHD-MCP-001',
                'tgl_panggil' => '2025-05-06',
                'tgl_jatuh_tempo' => '2025-05-11',
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            [
                'id' => 1040,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-KBJ-001',
                'tgl_panggil' => '2025-05-09',
                'tgl_jatuh_tempo' => '2025-05-14',
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            [
                'id' => 1041,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-KCO-001',
                'tgl_panggil' => '2025-05-10',
                'tgl_jatuh_tempo' => '2025-05-15',
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            [
                'id' => 1042,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-NGH-001',
                'tgl_panggil' => '2025-05-11',
                'tgl_jatuh_tempo' => '2025-05-16',
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
        ];

        foreach ($transaksi as $row) {
            Pemanggilan::updateOrCreate(
                ['id' => $row['id']],
                [
                    'user_id' => $users[$row['user_name']],
                    'khodam_id' => $khodams[$row['kode_khodam']],
                    'tgl_panggil' => $row['tgl_panggil'],
                    'tgl_jatuh_tempo' => $row['tgl_jatuh_tempo'],
                    'tgl_pelepasan' => $row['tgl_pelepasan'],
                    'mahar' => $row['mahar'],
                    'status' => $row['status'],
                ]
            );
        }
    }
}