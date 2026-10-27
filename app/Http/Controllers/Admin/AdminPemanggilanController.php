<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\KebijakanDenda;
use App\Http\Controllers\Controller;
use App\Models\Pemanggilan;
use App\Services\PemanggilanService;
use App\Support\StatusJatuhTempo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPemanggilanController extends Controller
{
    public function index(Request $request, KebijakanDenda $kebijakanDenda): JsonResponse
    {
        $today = Carbon::today();
        $tab = $request->query('tab', 'semua');

        // 1. Hitung total baris untuk masing-masing tab antarmuka
        $totalPermintaanPanggil = Pemanggilan::where('status', 'menunggu_persetujuan')->count();
        $totalPermintaanLepas = Pemanggilan::where('status', 'menunggu_pelepasan')->count();
        $totalAktif = Pemanggilan::whereIn('status', ['aktif', 'menunggu_pelepasan'])->count();
        $totalTerlambat = Pemanggilan::whereIn('status', ['aktif', 'menunggu_pelepasan'])
            ->whereDate('tgl_jatuh_tempo', '<', $today)
            ->count();
        $totalMasihBerjalan = Pemanggilan::whereIn('status', ['aktif', 'menunggu_pelepasan'])
            ->whereDate('tgl_jatuh_tempo', '>=', $today)
            ->count();
        $totalSemua = $totalAktif;

        // 2. Query dasar pemanggilan beserta relasinya
        $query = Pemanggilan::with([
            'user:id,name',
            'khodam:id,kode_khodam,nama',
        ]);

        if ($tab === 'permintaan_panggil') {
            $query->where('status', 'menunggu_persetujuan');
        } elseif ($tab === 'permintaan_lepas') {
            $query->where('status', 'menunggu_pelepasan');
        } elseif ($tab === 'terlambat') {
            $query->whereIn('status', ['aktif', 'menunggu_pelepasan'])->whereDate('tgl_jatuh_tempo', '<', $today);
        } elseif ($tab === 'masih_berjalan') {
            $query->whereIn('status', ['aktif', 'menunggu_pelepasan'])->whereDate('tgl_jatuh_tempo', '>=', $today);
        } else {
            // 'semua': menampilkan semua pemanggilan aktif dan menunggu pelepasan
            $query->whereIn('status', ['aktif', 'menunggu_pelepasan']);
        }

        $list = $query->orderBy('tgl_jatuh_tempo', 'asc')->get()->map(function ($item) use ($today, $kebijakanDenda) {
            $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo);

            $statusBadge = match ($item->status) {
                'menunggu_persetujuan' => 'Menunggu Persetujuan',
                'menunggu_pelepasan' => 'Menunggu Pelepasan',
                default => StatusJatuhTempo::badge($jatuhTempo, $today),
            };

            return [
                'id' => $item->id,
                'kode_transaksi' => 'PMG-'.str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'pengamal' => $item->user?->name,
                'khodam' => [
                    'nama' => $item->khodam?->nama,
                    'kode_khodam' => $item->khodam?->kode_khodam,
                ],
                'status' => $item->status,
                'tgl_panggil' => $item->tgl_panggil,
                'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                'status_badge' => $statusBadge,
                'catatan_admin' => $item->catatan_admin,
                'estimasi_mahar' => $kebijakanDenda->hitung($jatuhTempo, $today),
                'is_terlambat' => $item->status === 'aktif' && StatusJatuhTempo::hariTerlambat($jatuhTempo, $today) > 0,
            ];
        });

        return response()->json([
            'message' => 'Daftar pemanggilan aktif berhasil dimuat',
            'tabs' => [
                'semua' => $totalSemua,
                'terlambat' => $totalTerlambat,
                'masih_berjalan' => $totalMasihBerjalan,
                'permintaan_panggil' => $totalPermintaanPanggil,
                'permintaan_lepas' => $totalPermintaanLepas,
            ],
            'data' => $list,
        ]);
    }

    public function setujuiPanggil(Request $request, int $id, PemanggilanService $service): JsonResponse
    {
        $catatan = $request->input('catatan');
        $pemanggilan = $service->approvePanggil($id, $catatan);

        return response()->json([
            'message' => 'Permintaan pemanggilan khodam '.$pemanggilan->khodam?->nama.' berhasil disetujui. Khodam kini bersemayam.',
            'data' => [
                'id' => $pemanggilan->id,
                'pengamal' => $pemanggilan->user?->name,
                'khodam' => $pemanggilan->khodam?->nama,
                'status' => $pemanggilan->status,
                'tgl_panggil' => $pemanggilan->tgl_panggil,
                'tgl_jatuh_tempo' => $pemanggilan->tgl_jatuh_tempo,
            ],
        ]);
    }

    public function tolakPanggil(Request $request, int $id, PemanggilanService $service): JsonResponse
    {
        $catatan = $request->input('catatan');
        $pemanggilan = $service->rejectPanggil($id, $catatan);

        return response()->json([
            'message' => 'Permintaan pemanggilan khodam '.$pemanggilan->khodam?->nama.' telah ditolak.',
            'data' => [
                'id' => $pemanggilan->id,
                'status' => $pemanggilan->status,
                'catatan_admin' => $pemanggilan->catatan_admin,
            ],
        ]);
    }

    public function setujuiLepas(Request $request, int $id, PemanggilanService $service): JsonResponse
    {
        $catatan = $request->input('catatan');
        ['pemanggilan' => $pemanggilan, 'hari_terlambat' => $hariTerlambat] = $service->lepas($id, $catatan);

        return response()->json([
            'message' => 'Pelepasan khodam '.$pemanggilan->khodam?->nama.' berhasil disetujui dan diselesaikan.',
            'data' => [
                'id' => $pemanggilan->id,
                'pengamal' => $pemanggilan->user?->name,
                'khodam' => $pemanggilan->khodam?->nama,
                'tgl_pelepasan' => $pemanggilan->tgl_pelepasan,
                'hari_terlambat' => $hariTerlambat,
                'mahar_akhir' => $pemanggilan->mahar,
                'status' => $pemanggilan->status,
            ],
        ]);
    }

    public function tolakLepas(Request $request, int $id, PemanggilanService $service): JsonResponse
    {
        $catatan = $request->input('catatan');
        $pemanggilan = $service->rejectLepas($id, $catatan);

        return response()->json([
            'message' => 'Permintaan pelepasan khodam '.$pemanggilan->khodam?->nama.' ditolak. Khodam tetap bersemayam.',
            'data' => [
                'id' => $pemanggilan->id,
                'status' => $pemanggilan->status,
                'catatan_admin' => $pemanggilan->catatan_admin,
            ],
        ]);
    }

    public function lepas(string $id, PemanggilanService $service): JsonResponse
    {
        // Pemanggilan yang tidak ada / sudah dilepas tetap menghasilkan 404 seperti sebelumnya
        ['pemanggilan' => $pemanggilan, 'hari_terlambat' => $hariTerlambat] = $service->lepas((int) $id);

        return response()->json([
            'message' => 'Khodam '.$pemanggilan->khodam?->nama.' berhasil dilepaskan',
            'data' => [
                'id' => $pemanggilan->id,
                'pengamal' => $pemanggilan->user?->name,
                'khodam' => $pemanggilan->khodam?->nama,
                'tgl_pelepasan' => $pemanggilan->tgl_pelepasan,
                'hari_terlambat' => $hariTerlambat,
                'mahar_akhir' => $pemanggilan->mahar,
                'status' => $pemanggilan->status,
            ],
        ]);
    }
}
