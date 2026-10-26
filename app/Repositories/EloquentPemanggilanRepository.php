<?php

namespace App\Repositories;

use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use App\Repositories\Contracts\PemanggilanRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Implementasi PemanggilanRepositoryInterface berbasis Eloquent.
 */
class EloquentPemanggilanRepository implements PemanggilanRepositoryInterface
{
    public function kunciUser(int $userId): void
    {
        User::whereKey($userId)->lockForUpdate()->first();
    }

    public function kunciKhodam(int $khodamId): void
    {
        Khodam::whereKey($khodamId)->lockForUpdate()->first();
    }

    public function hitungAktifUser(int $userId): int
    {
        return Pemanggilan::where('user_id', $userId)
            ->where('status', 'aktif')
            ->count();
    }

    public function khodamSedangAktif(int $khodamId): bool
    {
        return Pemanggilan::where('khodam_id', $khodamId)
            ->where('status', 'aktif')
            ->exists();
    }

    public function buat(array $data): Pemanggilan
    {
        return Pemanggilan::create($data);
    }

    public function aktifMilikUser(int $userId): Collection
    {
        return Pemanggilan::with(['khodam.kategoris'])
            ->where('user_id', $userId)
            ->where('status', 'aktif')
            ->orderBy('tgl_jatuh_tempo', 'asc')
            ->get();
    }

    public function ambilAktifUntukDiubah(int $id): Pemanggilan
    {
        return Pemanggilan::with(['user', 'khodam'])
            ->where('status', 'aktif')
            ->lockForUpdate()
            ->findOrFail($id);
    }

    public function lepas(Pemanggilan $pemanggilan, Carbon $tglPelepasan, int $mahar): Pemanggilan
    {
        $pemanggilan->update([
            'tgl_pelepasan' => $tglPelepasan->toDateString(),
            'mahar' => $mahar,
            'status' => 'dilepas',
        ]);

        return $pemanggilan;
    }
}
