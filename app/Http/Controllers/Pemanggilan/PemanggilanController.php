<?php

namespace App\Http\Controllers\Pemanggilan;

use App\Contracts\KebijakanDenda;
use App\Http\Controllers\Controller;
use App\Models\Khodam;
use App\Services\PemanggilanService;
use App\Support\Halaman;
use App\Support\StatusJatuhTempo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Pemanggilan;

// Inheritance: semua controller mewarisi kelas dasar Controller milik aplikasi
class PemanggilanController extends Controller
{
    // 1. Ambil daftar katalog khodam
    public function index(Request $request): JsonResponse
    {
        $request->validate(Halaman::ATURAN);

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

        $query->orderBy('nama', 'asc');
        $halaman = Halaman::dari($query, $request);

        $khodams = ($halaman ? $halaman->getCollection() : $query->get())->map(function ($item) {
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

        $respons = [
            'message' => 'Daftar khodam berhasil dimuat',
            'data' => $khodams,
        ];

        if ($halaman) {
            $respons['meta'] = Halaman::meta($halaman);
        }

        return response()->json($respons);
    }

    // 2. Simpan pemanggilan khodam baru oleh Pengamal
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
            'message' => 'Pemanggilan berhasil dilakukan',
            'data' => $pemanggilan->load('khodam:id,kode_khodam,nama,asal,level_kekuatan'),
        ], 201);
    }

    // 3. Lihat daftar khodam yang sedang dipinjam oleh Pengamal sendiri (F-14)
    public function myActive(Request $request, PemanggilanService $service, KebijakanDenda $kebijakanDenda): JsonResponse
    {
        $today = Carbon::today();

        $aktif = $service->aktifMilik($request->user())
            ->map(function ($item) use ($today, $kebijakanDenda) {
                $jatuhTempo = Carbon::parse($item->tgl_jatuh_tempo);

                return [
                    'id' => $item->id,
                    'kode_transaksi' => 'PMG-'.str_pad($item->id, 4, '0', STR_PAD_LEFT),
                    'tgl_panggil' => $item->tgl_panggil,
                    'tgl_jatuh_tempo' => $item->tgl_jatuh_tempo,
                    'status_badge' => StatusJatuhTempo::badge($jatuhTempo, $today),
                    'estimasi_mahar' => $kebijakanDenda->hitung($jatuhTempo, $today),
                    'is_terlambat' => StatusJatuhTempo::hariTerlambat($jatuhTempo, $today) > 0,
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
            'kuota_maksimal' => (int) config('khodamku.maksimal_aktif'),
            'data' => $aktif,
        ]);
    }
    
public function ulasan(Request $request, $id): JsonResponse
{
    // 1. Validasi input dari frontend
    $validated = $request->validate([
        'rating' => ['required', 'integer', 'min:1', 'max:5'],
        'ulasan' => ['nullable', 'string', 'max:500'],
    ]);

    // 2. Cari data transaksi milik user yang sedang login
    $pemanggilan = Pemanggilan::where('user_id', $request->user()->id)->findOrFail($id);

    // 3. FIX ERROR 422: Gunakan strtolower agar tidak sensitif huruf besar/kecil
    if (strtolower($pemanggilan->status) !== 'dilepas') {
        return response()->json([
            'message' => 'Ulasan hanya bisa diberikan setelah khodam dilepas oleh admin.'
        ], 422);
    }

    // 4. Cek apakah sudah pernah diberi rating sebelumnya
    if ($pemanggilan->rating !== null) {
        return response()->json([
            'message' => 'Ulasan untuk pemanggilan ini sudah diberikan.'
        ], 422);
    }

    // 5. Simpan rating dan ulasan ke database
    $pemanggilan->update([
        'rating' => $validated['rating'],
        'ulasan' => $validated['ulasan'] ?? null,
    ]);

    return response()->json([
        'message' => 'Ulasan berhasil disimpan.',
        'data' => $pemanggilan
    ]);
}
}
