<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
    public function store(StoreUserRequest $request): JsonResponse
    {
        $newAdmin = DB::transaction(function () use ($request) {
            // 1. Buat user
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
                'role' => $request->validated('role'),
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
            'message' => 'Akun '.$newAdmin->role.' baru berhasil dibuat',
            'data' => $newAdmin->load('profile'),
        ], 201);
    }

    // 2b. Ubah data user (nama, email, password opsional, no_hp, alamat)
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validated();

        DB::transaction(function () use ($user, $data) {
            $akun = ['name' => $data['name'], 'email' => $data['email']];

            if (! empty($data['password'])) {
                $akun['password'] = $data['password'];
            }

            $user->update($akun);

            // Kolom profil bersifat wajib di DB, jadi nilai kosong disimpan sebagai '-'
            $profil = [];
            foreach (['no_hp', 'alamat'] as $kolom) {
                if (array_key_exists($kolom, $data)) {
                    $profil[$kolom] = $data[$kolom] ?? '-';
                }
            }

            $user->profile()
                ->firstOrNew([], ['no_hp' => '-', 'alamat' => '-', 'weton' => '-'])
                ->fill($profil)
                ->save();
        });

        return response()->json([
            'message' => 'Data user berhasil diperbarui',
            'data' => $user->load('profile'),
        ]);
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
