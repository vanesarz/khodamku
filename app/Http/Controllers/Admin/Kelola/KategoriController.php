<?php

namespace App\Http\Controllers\Admin\Kelola;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Khodam;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class KategoriController extends Controller
{
    // Ambil daftar kategori
    public function index(Request $request): JsonResponse
    {
        $query = Kategori::query();

        if ($request->has('search')) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        $kategoris = $query->get();

        return response()->json([
            'message' => 'Daftar kategori',
            'data' => $kategoris,
        ]);
    }

    // Simpan kategori baru
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string|max:255',
        ]);

        $kategori = Kategori::create($request->all());

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan',
            'data' => $kategori,
        ], 201);
    }

    // Update kategori
    public function update(Request $request, int $id): JsonResponse
    {
        $kategori = Kategori::findOrFail($id);

        $request->validate([
            'nama' => 'required|string|max:255',
            'deskripsi' => 'required|string|max:255',
        ]);

        $kategori->update($request->all());

        return response()->json([
            'message' => 'Kategori berhasil diperbarui',
            'data' => $kategori,
        ]);
    }

    // Detail kategori
    public function show(int $id): JsonResponse
    {
        $kategori = Kategori::findOrFail($id);

        return response()->json([
            'message' => 'Detail kategori',
            'data' => $kategori,
        ]);
    }

    // Hapus kategori
    public function destroy(int $id): JsonResponse
    {
        $kategori = Kategori::findOrFail($id);

        // Cek apakah ada khodam yang menggunakan kategori ini
        if ($kategori->khodams()->count() > 0) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh khodam',
            ], 400);
        }

        $kategori->delete();

        return response()->json([
            'message' => 'Kategori berhasil dihapus',
        ]);
    }
}
