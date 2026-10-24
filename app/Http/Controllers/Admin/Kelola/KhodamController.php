<?php

namespace App\Http\Controllers\Admin\Kelola;

use App\Http\Controllers\Controller;
use App\Models\Khodam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KhodamController extends Controller
{
    // 1. Ambil daftar khodam beserta filter pencarian dan status ketersediaan
    public function index(Request $request): JsonResponse
    {
        $query = Khodam::with('kategoris')
            ->withExists(['pemanggilans as is_bersemayam' => function ($q) {
                $q->where('status', 'aktif');
            }]);

        // Filter pencarian nama atau kode khodam
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('kode_khodam', 'like', "%{$search}%");
            });
        }

        // Filter kategori
        if ($request->filled('kategori_id')) {
            $query->whereHas('kategoris', function ($q) use ($request) {
                $q->where('kategoris.id', $request->kategori_id);
            });
        }

        // Filter toggle: hanya yang tersedia (Menunggu Dipanggil)
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

    // 2. Simpan unit khodam baru
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_khodam' => ['required', 'string', 'max:50', 'unique:khodams,kode_khodam'],
            'nama' => ['required', 'string', 'max:255'],
            'asal' => ['required', 'string', 'max:255'],
            'level_kekuatan' => ['required', 'integer', 'min:1', 'max:5'],
            'deskripsi' => ['required', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'kategori_ids' => ['required', 'array', 'min:1'],
            'kategori_ids.*' => ['integer', 'exists:kategoris,id'],
        ]);

        if ($request->hasFile('foto')) {
            $validated['foto'] = $request->file('foto')->store('khodams', 'public');
        }

        $khodam = Khodam::create($validated);
        $khodam->kategoris()->sync($request->kategori_ids);

        return response()->json([
            'message' => 'Khodam berhasil ditambahkan',
            'data' => $khodam->load('kategoris'),
        ], 201);
    }

    // 3. Detail satu khodam
    public function show($id): JsonResponse
    {
        $khodam = Khodam::with('kategoris')
            ->withExists(['pemanggilans as is_bersemayam' => function ($q) {
                $q->where('status', 'aktif');
            }])
            ->findOrFail($id);

        return response()->json([
            'message' => 'Detail khodam berhasil dimuat',
            'data' => [
                'id' => $khodam->id,
                'kode_khodam' => $khodam->kode_khodam,
                'nama' => $khodam->nama,
                'asal' => $khodam->asal,
                'level_kekuatan' => $khodam->level_kekuatan,
                'deskripsi' => $khodam->deskripsi,
                'foto' => $khodam->foto ? asset('storage/' . $khodam->foto) : null,
                'status' => $khodam->is_bersemayam ? 'Sedang Bersemayam' : 'Menunggu Dipanggil',
                'is_tersedia' => !$khodam->is_bersemayam,
                'kategoris' => $khodam->kategoris->map(fn($k) => [
                    'id' => $k->id,
                    'nama' => $k->nama,
                ]),
            ],
        ]);
    }

    // 4. Perbarui data khodam
    public function update(Request $request, $id): JsonResponse
    {
        $khodam = Khodam::findOrFail($id);

        $validated = $request->validate([
            'kode_khodam' => ['required', 'string', 'max:50', 'unique:khodams,kode_khodam,' . $id],
            'nama' => ['required', 'string', 'max:255'],
            'asal' => ['required', 'string', 'max:255'],
            'level_kekuatan' => ['required', 'integer', 'min:1', 'max:5'],
            'deskripsi' => ['required', 'string'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'kategori_ids' => ['required', 'array', 'min:1'],
            'kategori_ids.*' => ['integer', 'exists:kategoris,id'],
        ]);

        if ($request->hasFile('foto')) {
            if ($khodam->foto && Storage::disk('public')->exists($khodam->foto)) {
                Storage::disk('public')->delete($khodam->foto);
            }
            $validated['foto'] = $request->file('foto')->store('khodams', 'public');
        }

        $khodam->update($validated);
        $khodam->kategoris()->sync($request->kategori_ids);

        return response()->json([
            'message' => 'Data khodam berhasil diperbarui',
            'data' => $khodam->load('kategoris'),
        ]);
    }

    // 5. Hapus khodam
    public function destroy($id): JsonResponse
    {
        $khodam = Khodam::findOrFail($id);

        // Validasi: Khodam yang sedang bersemayam tidak boleh dihapus
        $sedangBersemayam = $khodam->pemanggilans()->where('status', 'aktif')->exists();
        if ($sedangBersemayam) {
            return response()->json([
                'message' => 'Khodam tidak dapat dihapus karena sedang bersemayam pada raga pengamal.',
            ], 422);
        }

        if ($khodam->foto && Storage::disk('public')->exists($khodam->foto)) {
            Storage::disk('public')->delete($khodam->foto);
        }

        $khodam->kategoris()->detach();
        $khodam->delete();

        return response()->json([
            'message' => 'Khodam berhasil dihapus',
        ]);
    }
}