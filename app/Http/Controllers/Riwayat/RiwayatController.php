<?php

namespace App\Http\Controllers\Riwayat;

use App\Contracts\KebijakanDenda;
use App\Http\Controllers\Controller;
use App\Models\Pemanggilan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiwayatController extends Controller
{
    public function index(Request $request, KebijakanDenda $kebijakanDenda): JsonResponse
    {
        $today = Carbon::today();

        $query = Pemanggilan::with('khodam:id,kode_khodam,nama')
            ->where('user_id', $request->user()->id);

        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tgl_panggil', '>=', $request->dari_tanggal);
        }
        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tgl_panggil', '<=', $request->sampai_tanggal);
        }

        $statusFilter = $request->query('status', 'semua');
        if ($statusFilter === 'dilepas') {
            $query->where('status', 'dilepas');
        } elseif ($statusFilter === 'terlambat') {
            $query->where('status', 'aktif')->whereDate('tgl_jatuh_tempo', '<', $today);
        } elseif ($statusFilter === 'aktif') {
            $query->where('status', 'aktif')->whereDate('tgl_jatuh_tempo', '>=', $today);
        }

        $transaksi = $query->orderBy('id', 'desc')->get();

        $totalMahar = 0;
        $listData = $transaksi->map(function ($item) use ($today, $kebijakanDenda, &$totalMahar) {
            $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo)->startOfDay();

            if ($item->status === 'aktif') {
                if ($today->gt($jatuhTempo)) {
                    $mahar = $kebijakanDenda->hitung($jatuhTempo, $today);
                    $statusLabel = 'Terlambat';
                } else {
                    $mahar = 0;
                    $statusLabel = 'Aktif';
                }
                $maharFormatted = '~Rp'.number_format($mahar, 0, ',', '.');
            } else {
                $mahar = (float) $item->mahar;
                $statusLabel = 'Dilepas';
                $maharFormatted = 'Rp'.number_format($mahar, 0, ',', '.');
            }

            $totalMahar += $mahar;

            return [
                'id' => $item->id,
                'kode_transaksi' => 'PMG-'.str_pad($item->id, 4, '0', STR_PAD_LEFT),
                'khodam' => [
                    'nama' => $item->khodam?->nama,
                    'kode_khodam' => $item->khodam?->kode_khodam,
                ],
                'tgl_panggil' => $item->tgl_panggil,
                'tgl_panggil_formatted' => Carbon::parse($item->tgl_panggil)->translatedFormat('d M Y'),
                'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                'tgl_jatuh_tempo_formatted' => $jatuhTempo->translatedFormat('d M Y'),
                'tgl_pelepasan' => $item->tgl_pelepasan,
                'tgl_pelepasan_formatted' => $item->tgl_pelepasan
                    ? Carbon::parse($item->tgl_pelepasan)->translatedFormat('d M Y')
                    : '—',
                'mahar' => $mahar,
                'mahar_formatted' => $maharFormatted,
                'status' => $statusLabel,
                'rating' => $item->rating,
                'ulasan' => $item->ulasan,
            ];
        });

        return response()->json([
            'message' => 'Riwayat pemanggilan berhasil dimuat',
            'ringkasan' => [
                'total_transaksi' => $listData->count(),
                'total_mahar' => $totalMahar,
                'total_mahar_formatted' => 'Rp'.number_format($totalMahar, 0, ',', '.'),
            ],
            'filter_options' => [
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
