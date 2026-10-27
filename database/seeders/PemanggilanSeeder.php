<?php

namespace Database\Seeders;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PemanggilanSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::pluck('id', 'name');
        $khodams = Khodam::pluck('id', 'kode_khodam');
        $today = Carbon::today();

        $transaksi = [
            // --- Transaksi Selesai (Dilepas) ---
            [
                'id' => 1028,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-MCP-002',
                'tgl_panggil' => $today->copy()->subDays(40)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->subDays(35)->toDateString(),
                'tgl_pelepasan' => $today->copy()->subDays(33)->toDateString(), // telat 2 hari -> mahar 10000
                'mahar' => 10000,
                'status' => 'dilepas',
            ],
            [
                'id' => 1030,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-HRM-001',
                'tgl_panggil' => $today->copy()->subDays(30)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->subDays(25)->toDateString(),
                'tgl_pelepasan' => $today->copy()->subDays(25)->toDateString(), // tepat waktu -> mahar 0
                'mahar' => 0,
                'status' => 'dilepas',
            ],
            [
                'id' => 1033,
                'user_name' => 'Sekar Ayu Lestari',
                'kode_khodam' => 'KHD-KDP-001',
                'tgl_panggil' => $today->copy()->subDays(22)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->subDays(17)->toDateString(),
                'tgl_pelepasan' => $today->copy()->subDays(15)->toDateString(), // telat 2 hari -> mahar 10000
                'mahar' => 10000,
                'status' => 'dilepas',
            ],
            [
                'id' => 1035,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-TPN-001',
                'tgl_panggil' => $today->copy()->subDays(15)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->subDays(10)->toDateString(),
                'tgl_pelepasan' => $today->copy()->subDays(11)->toDateString(), // tepat waktu -> mahar 0
                'mahar' => 0,
                'status' => 'dilepas',
            ],

            // --- Transaksi Pemanggilan Aktif (Sedang Bersemayam) ---
            // 1. Sedang Berlangsung (1 hari lagi)
            [
                'id' => 1039,
                'user_name' => 'Sekar Ayu Lestari',
                'kode_khodam' => 'KHD-MCP-001',
                'tgl_panggil' => $today->copy()->subDays(4)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->addDays(1)->toDateString(),
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            // 2. Terlambat / Telat 2 hari (denda Rp10.000)
            [
                'id' => 1040,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-KBJ-001',
                'tgl_panggil' => $today->copy()->subDays(7)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->subDays(2)->toDateString(),
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            // 3. Sedang Berlangsung (3 hari lagi)
            [
                'id' => 1041,
                'user_name' => 'Bima Saputra',
                'kode_khodam' => 'KHD-KCO-001',
                'tgl_panggil' => $today->copy()->subDays(2)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->addDays(3)->toDateString(),
                'tgl_pelepasan' => null,
                'mahar' => 0,
                'status' => 'aktif',
            ],
            // 4. Sedang Berlangsung (2 hari lagi)
            [
                'id' => 1042,
                'user_name' => 'Raka Pratama',
                'kode_khodam' => 'KHD-NGH-001',
                'tgl_panggil' => $today->copy()->subDays(3)->toDateString(),
                'tgl_jatuh_tempo' => $today->copy()->addDays(2)->toDateString(),
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
