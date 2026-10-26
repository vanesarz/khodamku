<?php

namespace App\Services;

use App\Contracts\KebijakanDenda;
use App\Exceptions\KhodamSedangBersemayamException;
use App\Exceptions\KuotaRagaPenuhException;
use App\Models\Pemanggilan;
use App\Models\User;
use App\Repositories\Contracts\PemanggilanRepositoryInterface;
use App\Support\StatusJatuhTempo;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Logika bisnis pemanggilan (peminjaman) dan pelepasan khodam.
 *
 * Kedua dependensi berupa interface; implementasi konkretnya disuntikkan
 * oleh service container sesuai binding di AppServiceProvider.
 */
class PemanggilanService
{
    public function __construct(
        private PemanggilanRepositoryInterface $repository,
        private KebijakanDenda $kebijakanDenda,
    ) {}

    /**
     * Panggil khodam untuk pengamal.
     *
     * Baris user dan khodam dikunci di dalam transaksi, sehingga dua permintaan
     * bersamaan tidak bisa sama-sama lolos cek kuota atau cek ketersediaan.
     *
     * @throws KuotaRagaPenuhException
     * @throws KhodamSedangBersemayamException
     */
    public function pinjam(User $user, int $khodamId, ?Carbon $tglPanggil = null): Pemanggilan
    {
        return DB::transaction(function () use ($user, $khodamId, $tglPanggil) {
            // Urutan kunci selalu user lalu khodam untuk menghindari deadlock
            $this->repository->kunciUser($user->id);
            $this->repository->kunciKhodam($khodamId);

            $maksimal = (int) config('khodamku.maksimal_aktif');
            if ($this->repository->hitungAktifUser($user->id) >= $maksimal) {
                throw new KuotaRagaPenuhException($maksimal);
            }

            if ($this->repository->khodamSedangAktif($khodamId)) {
                throw new KhodamSedangBersemayamException;
            }

            $tglPanggil = $tglPanggil?->copy()->startOfDay() ?? Carbon::today();
            $tglJatuhTempo = $tglPanggil->copy()->addDays((int) config('khodamku.durasi_hari'));

            return $this->repository->buat([
                'user_id' => $user->id,
                'khodam_id' => $khodamId,
                'tgl_panggil' => $tglPanggil->toDateString(),
                'tgl_jatuh_tempo' => $tglJatuhTempo->toDateString(),
                'status' => 'aktif',
            ]);
        });
    }

    /**
     * Lepas khodam hari ini dan catat mahar denda menurut KebijakanDenda.
     *
     * @return array{pemanggilan: Pemanggilan, hari_terlambat: int}
     */
    public function lepas(int $id): array
    {
        return DB::transaction(function () use ($id) {
            $pemanggilan = $this->repository->ambilAktifUntukDiubah($id);

            $today = Carbon::today();
            $jatuhTempo = Carbon::parse($pemanggilan->tgl_jatuh_tempo);
            $mahar = $this->kebijakanDenda->hitung($jatuhTempo, $today);

            return [
                'pemanggilan' => $this->repository->lepas($pemanggilan, $today, $mahar),
                'hari_terlambat' => StatusJatuhTempo::hariTerlambat($jatuhTempo, $today),
            ];
        });
    }

    /**
     * @return Collection<int, Pemanggilan>
     */
    public function aktifMilik(User $user): Collection
    {
        return $this->repository->aktifMilikUser($user->id);
    }
}
