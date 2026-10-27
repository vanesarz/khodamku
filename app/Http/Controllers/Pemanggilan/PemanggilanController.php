<?php

namespace App\Http\Controllers\Pemanggilan;

use App\Contracts\KebijakanDenda;
use App\Http\Controllers\Controller;
use App\Models\Khodam;
use App\Services\PemanggilanService;
use App\Support\StatusJatuhTempo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Inheritance: semua controller mewarisi kelas dasar Controller milik aplikasi
class PemanggilanController extends Controller
{
    // 1. Ambil daftar katalog khodam
    public function index(Request $request): JsonResponse
    {
        $query = Khodam::with('kategoris')
            ->withExists(['pemanggilans as is_bersemayam' => function ($q) {
                $q->whereIn('status', ['aktif', 'menunggu_persetujuan', 'menunggu_pelepasan']);
            }]);

        // Filter pencarian berdasarkan nama atau kode khodam
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode_khodam', 'like', "%{$search}%");
            });
        }

        // Filter berdasarkan kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('kategoris', function ($q) use ($request) {
                $q->where('kategoris.id', $request->kategori_id);
            });
        }

        // Filter toggle: hanya tampilkan yang tersedia (Menunggu Dipanggil)
        if ($request->boolean('hanya_tersedia')) {
            $query->whereDoesntHave('pemanggilans', function ($q) {
                $q->whereIn('status', ['aktif', 'menunggu_persetujuan', 'menunggu_pelepasan']);
            });
        }

        $khodams = $query->orderBy('nama', 'asc')->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'kode_khodam' => $item->kode_khodam,
                'nama' => $item->nama,
                'asal' => $item->asal,
                'level_kekuatan' => $item->level_kekuatan,
                'deskripsi' => $item->deskripsi,
                'foto' => $item->foto ? asset('storage/'.$item->foto) : null,
                'status' => $item->is_bersemayam ? 'Sedang Bersemayam' : 'Menunggu Dipanggil',
                'is_tersedia' => ! $item->is_bersemayam,
                'kategoris' => $item->kategoris->map(fn ($k) => [
                    'id' => $k->id,
                    'nama' => $k->nama,
                ]),
            ];
        });

        return response()->json([
            'message' => 'Daftar khodam berhasil dimuat',
            'data' => $khodams,
        ]);
    }

    // 2. Simpan permintaan pemanggilan khodam baru oleh Pengamal
    public function store(Request $request, PemanggilanService $service): JsonResponse
    {
        $request->validate([
            'khodam_id' => ['required', 'integer', 'exists:khodams,id'],
            'tgl_panggil' => ['nullable', 'date'],
        ]);

        // Pelanggaran kuota / khodam terpakai dilempar sebagai exception dan dirender jadi JSON 422
        $pemanggilan = $service->pinjam(
            $request->user(),
            $request->integer('khodam_id'),
            $request->filled('tgl_panggil') ? Carbon::parse($request->tgl_panggil) : null,
        );

        return response()->json([
            'message' => 'Permintaan pemanggilan berhasil diajukan, menunggu persetujuan Juru Kunci',
            'data' => $pemanggilan->load('khodam:id,kode_khodam,nama,asal,level_kekuatan'),
        ], 201);
    }

    // 3. Pengamal mengajukan pelepasan khodam
    public function requestLepas(Request $request, int $id, PemanggilanService $service): JsonResponse
    {
        $pemanggilan = $service->requestLepas($request->user(), $id);

        return response()->json([
            'message' => 'Permintaan pelepasan khodam berhasil diajukan, menunggu konfirmasi Juru Kunci',
            'data' => $pemanggilan->load('khodam:id,kode_khodam,nama,asal,level_kekuatan'),
        ]);
    }

    // 4. Lihat daftar khodam yang sedang dipinjam atau dalam proses oleh Pengamal sendiri
    public function myActive(Request $request, PemanggilanService $service, KebijakanDenda $kebijakanDenda): JsonResponse
    {
        $today = Carbon::today();

        $aktif = $service->aktifMilik($request->user())
            ->map(function ($item) use ($today, $kebijakanDenda) {
                $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo);

                $statusBadge = match ($item->status) {
                    'menunggu_persetujuan' => 'Menunggu Persetujuan',
                    'menunggu_pelepasan' => 'Menunggu Pelepasan',
                    default => StatusJatuhTempo::badge($jatuhTempo, $today),
                };

                return [
                    'id' => $item->id,
                    'kode_transaksi' => 'PMG-'.str_pad($item->id, 4, '0', STR_PAD_LEFT),
                    'tgl_panggil' => $item->tgl_panggil,
                    'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                    'status' => $item->status,
                    'status_badge' => $statusBadge,
                    'catatan_admin' => $item->catatan_admin,
                    'estimasi_mahar' => $kebijakanDenda->hitung($jatuhTempo, $today),
                    'is_terlambat' => $item->status === 'aktif' && StatusJatuhTempo::hariTerlambat($jatuhTempo, $today) > 0,
                    'khodam' => [
                        'id' => $item->khodam?->id,
                        'kode_khodam' => $item->khodam?->kode_khodam,
                        'nama' => $item->khodam?->nama,
                        'asal' => $item->khodam?->asal,
                        'level_kekuatan' => $item->khodam?->level_kekuatan,
                    ],
                ];
            });

        return response()->json([
            'message' => 'Daftar pemanggilan aktif Anda berhasil dimuat',
            'kuota_terpakai' => $aktif->whereIn('status', ['aktif', 'menunggu_persetujuan', 'menunggu_pelepasan'])->count(),
            'kuota_maksimal' => (int) config('khodamku.maksimal_aktif'),
            'data' => $aktif,
        ]);
    }
}
