<?php

namespace Database\Seeders;

use App\Models\Kategori;
use App\Models\Khodam;
use Illuminate\Database\Seeder;

class KhodamSeeder extends Seeder
{
    public function run(): void
    {
        $dataKhodam = [
            [
                'kode_khodam' => 'KHD-MCP-001',
                'nama' => 'Macan Putih',
                'asal' => 'Alas Purwo, Banyuwangi',
                'level_kekuatan' => 4,
                'deskripsi' => 'Sosok macan putih sakti penjaga gerbang gaib ujung timur Jawa.',
                'kategoris' => ['Penjaga Rumah', 'Kewibawaan'],
            ],
            [
                'kode_khodam' => 'KHD-MCP-002',
                'nama' => 'Macan Putih',
                'asal' => 'Gunung Lawu, Karanganyar',
                'level_kekuatan' => 5,
                'deskripsi' => 'Siluman macan putih bertuah penunggu kabut mistis puncak Lawu.',
                'kategoris' => ['Penjaga Rumah', 'Kewibawaan'],
            ],
            [
                'kode_khodam' => 'KHD-HRM-001',
                'nama' => 'Harimau Sumatra',
                'asal' => 'Bukit Barisan, Sumatra Barat',
                'level_kekuatan' => 4,
                'deskripsi' => 'Aura rimba Sumatra yang kuat untuk proteksi dan wibawa tingkat tinggi.',
                'kategoris' => ['Kewibawaan', 'Penolak Bala'],
            ],
            [
                'kode_khodam' => 'KHD-KBJ-001',
                'nama' => 'Kakek Berjubah Putih',
                'asal' => 'Pertapaan Kendalisada',
                'level_kekuatan' => 3,
                'deskripsi' => 'Sosok sepuh bijak penuntun ketenangan batin dan penangkal marabahaya.',
                'kategoris' => ['Pelindung Ujian', 'Penolak Bala'],
            ],
            [
                'kode_khodam' => 'KHD-NGH-001',
                'nama' => 'Naga Hijau',
                'asal' => 'Telaga Sarangan, Magetan',
                'level_kekuatan' => 5,
                'deskripsi' => 'Naga mistis pembawa aura kemakmuran dan pelaris dagangan.',
                'kategoris' => ['Penglaris Dagangan'],
            ],
            [
                'kode_khodam' => 'KHD-KCO-001',
                'nama' => 'Kucing Oren Barbar',
                'asal' => 'Gang Kelinci, Jakarta',
                'level_kekuatan' => 3,
                'deskripsi' => 'Penjaga rumah yang lincah, berani, dan siap mengusir energi negatif.',
                'kategoris' => ['Penjaga Rumah'],
            ],
            [
                'kode_khodam' => 'KHD-KDP-001',
                'nama' => 'Kulkas Dua Pintu',
                'asal' => 'Pasar Elektronik Glodok',
                'level_kekuatan' => 2,
                'deskripsi' => 'Khodam pendingin emosi dan penglaris perniagaan kuliner.',
                'kategoris' => ['Penglaris Dagangan'],
            ],
            [
                'kode_khodam' => 'KHD-TPN-001',
                'nama' => 'Tutup Panci',
                'asal' => 'Dapur Bu Sum, Solo',
                'level_kekuatan' => 1,
                'deskripsi' => 'Menutup masa lalu dan mempermudah menemukan jodoh yang pas pasangannya.',
                'kategoris' => ['Pencari Jodoh'],
            ],
        ];

        foreach ($dataKhodam as $item) {
            $kategoriNames = $item['kategoris'];
            unset($item['kategoris']);

            $khodam = Khodam::updateOrCreate(['kode_khodam' => $item['kode_khodam']], $item);

            $kategoriIds = Kategori::whereIn('nama', $kategoriNames)->pluck('id');
            $khodam->kategoris()->sync($kategoriIds);
        }
    }
}
