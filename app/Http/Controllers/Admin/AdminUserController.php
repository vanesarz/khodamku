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
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $newAdmin = DB::transaction(function () use ($request) {
            // 1. Buat user dengan role terkunci 'admin'
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->string('password')),
                'role' => 'admin',
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
            'message' => 'Akun admin baru berhasil dibuat',
            'data' => $newAdmin->load('profile'),
        ], 201);
    }
}