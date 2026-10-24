<?php

namespace Database\Seeders;

use App\Models\Kategori;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KategoriSeeder extends Seeder
{
    public function run(): void
    {
        $kategoris = [
            [
                'nama' => 'Penjaga Rumah',
                'deskripsi' => 'Entitas penjaga batas pekarangan dan kediaman dari gangguan gaib.',
            ],
            [
                'nama' => 'Penglaris Dagangan',
                'deskripsi' => 'Penarik energi kemakmuran dan pelancar transaksi perniagaan.',
            ],
            [
                'nama' => 'Pelindung Ujian',
                'deskripsi' => 'Membantu ketenangan batin, kejernihan pikiran, dan fokus belajar.',
            ],
            [
                'nama' => 'Kewibawaan',
                'deskripsi' => 'Meningkatkan karisma, disegani kawan maupun lawan.',
            ],
            [
                'nama' => 'Penolak Bala',
                'deskripsi' => 'Menangkal teluh, santet, dan marabahaya gaib tingkat tinggi.',
            ],
            [
                'nama' => 'Pencari Jodoh',
                'deskripsi' => 'Membuka pancaran aura asmara dan mempertemukan jodoh sejati.',
            ],
        ];

        foreach ($kategoris as $item) {
            Kategori::updateOrCreate(['nama' => $item['nama']], $item);
        }
    }
}
