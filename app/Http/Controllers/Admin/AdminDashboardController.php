<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Khodam;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class AdminDashboardController extends Controller
{
    private const TARIF_DENDA_PER_HARI = 5000;

    public function index(): JsonResponse
    {
        $today = Carbon::today();
        $terlambat = $this->getPemanggilanTerlambat($today);

        return response()->json([
            'message' => 'Data dashboard',
            'data' => [
                'tanggal' => $today->toDateString(),
                'ringkasan' => $this->getRingkasan($terlambat, $today),
                'statistik' => $this->getStatistik($terlambat->count()),
                'jatuh_tempo_terdekat' => $this->getJatuhTempoTerdekat($today),
                'kategori' => $this->getKategori(),
                'pengamal_terdaftar' => User::where('role', 'pengamal')->count(),
                'mahar_terkumpul' => (float) Pemanggilan::where('status', 'dilepas')->sum('mahar'),
            ],
        ]);
    }

    public function statistik(): JsonResponse
    {
        $terlambat = $this->getPemanggilanTerlambat(Carbon::today());

        return response()->json([
            'message' => 'Statistik dashboard',
            'data' => $this->getStatistik($terlambat->count()),
        ]);
    }

    public function jatuhTempoTerdekat(): JsonResponse
    {
        return response()->json([
            'message' => 'Jatuh tempo terdekat',
            'data' => $this->getJatuhTempoTerdekat(Carbon::today()),
        ]);
    }

    public function kategori(): JsonResponse
    {
        return response()->json([
            'message' => 'Kategori dashboard',
            'data' => $this->getKategori(),
        ]);
    }

    public function ringkasan(): JsonResponse
    {
        $today = Carbon::today();

        return response()->json([
            'message' => 'Ringkasan dashboard',
            'data' => [
                'tanggal' => $today->toDateString(),
                'ringkasan' => $this->getRingkasan($this->getPemanggilanTerlambat($today), $today),
                'pengamal_terdaftar' => User::where('role', 'pengamal')->count(),
                'mahar_terkumpul' => (float) Pemanggilan::where('status', 'dilepas')->sum('mahar'),
            ],
        ]);
    }

    private function getPemanggilanTerlambat(Carbon $today): Collection
    {
        return Pemanggilan::where('status', 'aktif')
            ->whereDate('tgl_jatuh_tempo', '<', $today)
            ->get(['id', 'tgl_jatuh_tempo']);
    }

    private function getRingkasan(Collection $terlambat, Carbon $today): array
    {
        $estimasiMahar = $terlambat->sum(
            fn ($p) => Carbon::parse($p->tgl_jatuh_tempo)->startOfDay()->diffInDays($today) * self::TARIF_DENDA_PER_HARI
        );

        return [
            'terlambat' => $terlambat->count(),
            'estimasi_mahar_terlambat' => $estimasiMahar,
        ];
    }

    private function getStatistik(int $jumlahTerlambat): array
    {
        $aktif = Pemanggilan::where('status', 'aktif');

        $jumlahUnit = Khodam::count();
        $sedangBersemayam = (clone $aktif)->distinct('khodam_id')->count('khodam_id');

        return [
            'jumlah_unit' => $jumlahUnit,
            'menunggu_dipanggil' => max($jumlahUnit - $sedangBersemayam, 0),
            'sedang_bersemayam' => $sedangBersemayam,
            'pemanggilan_aktif' => (clone $aktif)->count(),
            'terlambat' => $jumlahTerlambat,
        ];
    }

    private function getJatuhTempoTerdekat(Carbon $today, int $limit = 4): Collection
    {
        return Pemanggilan::with(['user:id,name', 'khodam:id,kode_khodam,nama'])
            ->where('status', 'aktif')
            ->orderBy('tgl_jatuh_tempo', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($item) use ($today) {
                $selisih = (int) $today->diffInDays(Carbon::parse($item->tgl_jatuh_tempo)->startOfDay(), false);

                return [
                    'id' => $item->id,
                    'khodam' => [
                        'nama' => $item->khodam?->nama,
                        'kode_khodam' => $item->khodam?->kode_khodam,
                    ],
                    'pengamal' => $item->user?->name,
                    'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                    'status_badge' => $this->buatBadge($selisih),
                    'is_terlambat' => $selisih < 0,
                ];
            });
    }

    private function buatBadge(int $selisihHari): string
    {
        return match (true) {
            $selisihHari < 0 => 'Telat ' . abs($selisihHari) . ' hari',
            $selisihHari === 0 => 'Hari ini',
            default => $selisihHari . ' hari lagi',
        };
    }

    private function getKategori(): Collection
    {
        return Kategori::withCount('khodams')
            ->orderBy('nama')
            ->get()
            ->map(fn ($k) => [
                'id' => $k->id,
                'nama' => $k->nama,
                'jumlah_khodam' => $k->khodams_count,
            ]);
    }
}
