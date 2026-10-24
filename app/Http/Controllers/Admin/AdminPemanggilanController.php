<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pemanggilan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminPemanggilanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $today = Carbon::today();
        $tab = $request->query('tab', 'semua');

        // 1. Hitung total baris untuk masing-masing tab antarmuka
        $totalSemua = Pemanggilan::where('status', 'aktif')->count();
        $totalTerlambat = Pemanggilan::where('status', 'aktif')
            ->whereDate('tgl_jatuh_tempo', '<', $today)
            ->count();
        $totalMasihBerjalan = Pemanggilan::where('status', 'aktif')
            ->whereDate('tgl_jatuh_tempo', '>=', $today)
            ->count();

        // 2. Query dasar pemanggilan aktif beserta relasinya
        $query = Pemanggilan::with([
            'user:id,name',
            'khodam:id,kode_khodam,nama',
        ])->where('status', 'aktif');

        if ($tab === 'terlambat') {
            $query->whereDate('tgl_jatuh_tempo', '<', $today);
        } elseif ($tab === 'masih_berjalan') {
            $query->whereDate('tgl_jatuh_tempo', '>=', $today);
        }

        $list = $query->orderBy('tgl_jatuh_tempo', 'asc')->get()->map(function ($item) use ($today) {
            $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo)->startOfDay();
            
            $hariTerlambat = 0;
            if ($today->gt($jatuhTempo)) {
                $hariTerlambat = $jatuhTempo->diffInDays($today);
                $statusBadge = 'Telat ' . $hariTerlambat . ' hari';
            } elseif ($today->equalTo($jatuhTempo)) {
                $statusBadge = 'Hari ini';
            } else {
                $sisaHari = $today->diffInDays($jatuhTempo);
                $statusBadge = $sisaHari . ' hari lagi';
            }

            $estimasiMahar = $hariTerlambat * 5000;

            return [
                'id' => $item->id,
                'kode_transaksi' => 'PMG-' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'pengamal' => $item->user?->name,
                'khodam' => [
                    'nama' => $item->khodam?->nama,
                    'kode_khodam' => $item->khodam?->kode_khodam,
                ],
                'tgl_panggil' => $item->tgl_panggil,
                'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                'status_badge' => $statusBadge,
                'estimasi_mahar' => $estimasiMahar,
                'is_terlambat' => $hariTerlambat > 0,
            ];
        });

        return response()->json([
            'message' => 'Daftar pemanggilan aktif berhasil dimuat',
            'tabs' => [
                'semua' => $totalSemua,
                'terlambat' => $totalTerlambat,
                'masih_berjalan' => $totalMasihBerjalan,
            ],
            'data' => $list,
        ]);
    }

    public function lepas($id): JsonResponse
    {
        $pemanggilan = Pemanggilan::with(['user', 'khodam'])
            ->where('status', 'aktif')
            ->findOrFail($id);

        $today = Carbon::today();
        $jatuhTempo = Carbon::parse($pemanggilan->tgl_jatuh_tempo)->startOfDay();

        // Hitung biaya keterlambatan jika tanggal pengembalian melewati jatuh tempo
        $hariTerlambat = 0;
        if ($today->gt($jatuhTempo)) {
            $hariTerlambat = $jatuhTempo->diffInDays($today);
        }
        $maharAkhir = $hariTerlambat * 5000;

        $pemanggilan->update([
            'tgl_pelepasan' => $today->toDateString(),
            'mahar' => $maharAkhir,
            'status' => 'dilepas',
        ]);

        return response()->json([
            'message' => 'Khodam ' . $pemanggilan->khodam?->nama . ' berhasil dilepaskan',
            'data' => [
                'id' => $pemanggilan->id,
                'pengamal' => $pemanggilan->user?->name,
                'khodam' => $pemanggilan->khodam?->nama,
                'tgl_pelepasan' => $pemanggilan->tgl_pelepasan,
                'hari_terlambat' => $hariTerlambat,
                'mahar_akhir' => $maharAkhir,
                'status' => $pemanggilan->status,
            ],
        ]);
    }
}
