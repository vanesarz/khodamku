<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminUserController extends Controller
{
    // 1. Ambil daftar user
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        // Pencarian
        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        // Filter Role
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        // Pagination
        $users = $query->with('profile')->paginate(20);

        return response()->json([
            'message' => 'Daftar user',
            'data' => $users,
        ]);
    }

    // 2. Tambah user baru (bisa admin atau pengamal)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $newAdmin = DB::transaction(function () use ($request) {
            // 1. Buat user 
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->string('password')),
                'role' => $request->role,
            ]);

            // 2. Record profil default
            $user->profile()->create([
                'no_hp' => '-',
                'alamat' => '-',
                'weton' => '-',
                'tanggal_lahir' => null,
                'foto' => null,
            ]);

            return $user;
        });

        return response()->json([
            'message' => 'Akun ' . $request->role . ' baru berhasil dibuat',
            'data' => $newAdmin->load('profile'),
        ], 201);
    }

    // 3. Detail user
    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'message' => 'Detail user',
            'data' => $user->load('profile'),
        ]);
    }

    // 4. Hapus user
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // 1. Hapus relasi profile
        $user->profile()->delete();

        // 2. Hapus user
        $user->delete();

        return response()->json([
            'message' => 'Akun user berhasil dihapus',
        ]);
    }
}