<?php

namespace App\Repositories\Contracts;

use App\Models\Pemanggilan;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Interface: akses data pemanggilan.
 *
 * PemanggilanService hanya mengenal interface ini, sehingga di unit test
 * repository bisa diganti mock tanpa database.
 */
interface PemanggilanRepositoryInterface
{
    /**
     * Kunci baris user (SELECT ... FOR UPDATE) agar pemanggilan milik user yang sama diproses bergiliran.
     */
    public function kunciUser(int $userId): void;

    /**
     * Kunci baris khodam agar satu khodam tidak dipanggil dua pengamal sekaligus.
     */
    public function kunciKhodam(int $khodamId): void;

    public function hitungAktifUser(int $userId): int;

    public function khodamSedangAktif(int $khodamId): bool;

    /**
     * @param  array{user_id: int, khodam_id: int, tgl_panggil: string, tgl_jatuh_tempo: string, status: string}  $data
     */
    public function buat(array $data): Pemanggilan;

    /**
     * Pemanggilan aktif milik user, urut jatuh tempo terdekat.
     *
     * @return Collection<int, Pemanggilan>
     */
    public function aktifMilikUser(int $userId): Collection;

    /**
     * Ambil pemanggilan berstatus aktif dan kunci barisnya; 404 jika tidak ada.
     */
    public function ambilAktifUntukDiubah(int $id): Pemanggilan;

    public function lepas(Pemanggilan $pemanggilan, Carbon $tglPelepasan, int $mahar): Pemanggilan;
}
