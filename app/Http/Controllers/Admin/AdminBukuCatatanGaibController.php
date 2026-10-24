<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pemanggilan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class AdminBukuCatatanGaibController extends Controller
{
public function index(Request $request): JsonResponse
    {
        $today = Carbon::today();

        // 1. Inisialisasi query relasi
        $query = Pemanggilan::with([
            'user:id,name',
            'khodam:id,kode_khodam,nama',
        ]);

        // 2. Filter: Pengamal
        if ($request->filled('pengamal_id')) {
            $query->where('user_id', $request->pengamal_id);
        }

        // 3. Filter: Rentang Tanggal Pemanggilan
        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tgl_panggil', '>=', $request->dari_tanggal);
        }
        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tgl_panggil', '<=', $request->sampai_tanggal);
        }

        // 4. Filter: Status ('semua', 'aktif', 'terlambat', 'dilepas')
        $statusFilter = $request->query('status', 'semua');
        if ($statusFilter === 'dilepas') {
            $query->where('status', 'dilepas');
        } elseif ($statusFilter === 'terlambat') {
            $query->where('status', 'aktif')->whereDate('tgl_jatuh_tempo', '<', $today);
        } elseif ($statusFilter === 'aktif') {
            $query->where('status', 'aktif')->whereDate('tgl_jatuh_tempo', '>=', $today);
        }

        // Urutkan transaksi dari yang paling baru
        $transaksi = $query->orderBy('id', 'desc')->get();

        // 5. Transformasi Data & Hitung Kalkulasi Mahar
        $totalMahar = 0;
        $listData = $transaksi->map(function ($item) use ($today, &$totalMahar) {
            $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo)->startOfDay();
            $isAktif = $item->status === 'aktif';

            // Tentukan status badge dan perhitungan mahar
            if ($isAktif) {
                if ($today->gt($jatuhTempo)) {
                    $hariTerlambat = $jatuhTempo->diffInDays($today);
                    $mahar = $hariTerlambat * 5000;
                    $statusLabel = 'Terlambat';
                    $maharFormatted = '~Rp' . number_format($mahar, 0, ',', '.');
                } else {
                    $mahar = 0;
                    $statusLabel = 'Aktif';
                    $maharFormatted = '~Rp0';
                }
            } else {
                $mahar = (float) $item->mahar;
                $statusLabel = 'Dilepas';
                $maharFormatted = 'Rp' . number_format($mahar, 0, ',', '.');
            }

            $totalMahar += $mahar;

            return [
                'id' => $item->id,
                'kode_transaksi' => 'PMG-' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'pengamal' => $item->user?->name,
                'khodam' => [
                    'nama' => $item->khodam?->nama,
                    'kode_khodam' => $item->khodam?->kode_khodam,
                ],
                'tgl_panggil' => $item->tgl_panggil,
                'tgl_panggil_formatted' => Carbon::parse($item->tgl_panggil)->translatedFormat('d M Y'),
                'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                'tgl_jatuh_tempo_formatted' => Carbon::parse($item->tgl_jatuh_tempo)->translatedFormat('d M Y'),
                'tgl_pelepasan' => $item->tgl_pelepasan,
                'tgl_pelepasan_formatted' => $item->tgl_pelepasan
                    ? Carbon::parse($item->tgl_pelepasan)->translatedFormat('d M Y')
                    : '—',
                'mahar' => $mahar,
                'mahar_formatted' => $maharFormatted,
                'status' => $statusLabel,
            ];
        });

        // 6. Data master pengamal untuk dropdown filter antarmuka
        $daftarPengamal = User::where('role', 'pengamal')
            ->select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'message' => 'Data Buku Catatan Gaib berhasil dimuat',
            'ringkasan' => [
                'total_transaksi' => $listData->count(),
                'total_mahar' => $totalMahar,
                'total_mahar_formatted' => 'Rp' . number_format($totalMahar, 0, ',', '.'),
            ],
            'filter_options' => [
                'pengamals' => $daftarPengamal,
                'statuses' => [
                    ['value' => 'semua', 'label' => 'Semua status'],
                    ['value' => 'aktif', 'label' => 'Aktif'],
                    ['value' => 'terlambat', 'label' => 'Terlambat'],
                    ['value' => 'dilepas', 'label' => 'Dilepas'],
                ],
            ],
            'data' => $listData,
        ]);
    }
}
