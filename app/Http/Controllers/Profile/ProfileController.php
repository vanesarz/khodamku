<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller
{
    // Menampilkan profil user yang sedang login
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return response()->json([
            'message' => 'Data profil berhasil diambil',
            'data' => $user,
        ]);
    }

    // Memperbarui data profil sendiri
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'no_hp' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
            'tanggal_lahir' => ['nullable', 'date'],
            'weton' => ['required', 'string', 'max:50'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        $user = $request->user();

        // Update nama user jika dikirim
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        $profileData = $request->only(['no_hp', 'alamat', 'tanggal_lahir', 'weton']);

        // Upload foto jika disertakan
        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('profiles', 'public');
            $profileData['foto'] = $path;
        }

        $user->profile()->update($profileData);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => $user->load('profile'),
        ]);
    }
}
