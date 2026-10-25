<?php

namespace App\Http\Controllers\Pemanggilan;

use App\Http\Controllers\Controller;
use App\Models\Khodam;
use App\Models\Pemanggilan;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PemanggilanController extends Controller
{
    private const MAKSIMAL_AKTIF = 2;
    private const DURASI_HARI = 5;
    private const TARIF_DENDA_PER_HARI = 5000;

    // 1. Ambil daftar katalog khodam
    public function index(Request $request): JsonResponse
    {
        $query = Khodam::with('kategoris')
            ->withExists(['pemanggilans as is_bersemayam' => function ($q) {
                $q->where('status', 'aktif');
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
                $q->where('status', 'aktif');
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
                'foto' => $item->foto ? asset('storage/' . $item->foto) : null,
                'status' => $item->is_bersemayam ? 'Sedang Bersemayam' : 'Menunggu Dipanggil',
                'is_tersedia' => !$item->is_bersemayam,
                'kategoris' => $item->kategoris->map(fn($k) => [
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

    // 2. Simpan pemanggilan khodam baru oleh Pengamal
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'khodam_id' => ['required', 'integer', 'exists:khodams,id'],
            'tgl_panggil' => ['nullable', 'date'],
        ]);

        $jumlahAktif = Pemanggilan::where('user_id', $user->id)
            ->where('status', 'aktif')
            ->count();

        if ($jumlahAktif >= self::MAKSIMAL_AKTIF) {
            return response()->json([
                'message' => 'Raga Anda hanya kuat menampung maksimal 2 khodam aktif secara bersamaan.',
            ], 422);
        }

        $sedangBersemayam = Pemanggilan::where('khodam_id', $request->khodam_id)
            ->where('status', 'aktif')
            ->exists();

        if ($sedangBersemayam) {
            return response()->json([
                'message' => 'Khodam ini sedang bersemayam di raga pengamal lain.',
            ], 422);
        }

        $tglPanggil = $request->filled('tgl_panggil')
            ? Carbon::parse($request->tgl_panggil)->startOfDay()
            : Carbon::today();

        $tglJatuhTempo = $tglPanggil->copy()->addDays(self::DURASI_HARI);

        $pemanggilan = Pemanggilan::create([
            'user_id' => $user->id,
            'khodam_id' => $request->khodam_id,
            'tgl_panggil' => $tglPanggil->toDateString(),
            'tgl_jatuh_tempo' => $tglJatuhTempo->toDateString(),
            'status' => 'aktif',
        ]);

        return response()->json([
            'message' => 'Pemanggilan berhasil dilakukan',
            'data' => $pemanggilan->load('khodam:id,kode_khodam,nama,asal,level_kekuatan'),
        ], 201);
    }

    // 3. Lihat daftar khodam yang sedang dipinjam oleh Pengamal sendiri (F-14)
    public function myActive(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = Carbon::today();

        $aktif = Pemanggilan::with(['khodam.kategoris'])
            ->where('user_id', $user->id)
            ->where('status', 'aktif')
            ->orderBy('tgl_jatuh_tempo', 'asc')
            ->get()
            ->map(function ($item) use ($today) {
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

                return [
                    'id' => $item->id,
                    'kode_transaksi' => 'PMG-' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                    'tgl_panggil' => $item->tgl_panggil,
                    'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                    'status_badge' => $statusBadge,
                    'estimasi_mahar' => $hariTerlambat * self::TARIF_DENDA_PER_HARI,
                    'is_terlambat' => $hariTerlambat > 0,
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
            'kuota_terpakai' => $aktif->count(),
            'kuota_maksimal' => self::MAKSIMAL_AKTIF,
            'data' => $aktif,
        ]);
    }
}