<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

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
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'hapus_foto' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        // Update nama user jika dikirim
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        $profileData = $request->only(['no_hp', 'alamat', 'tanggal_lahir', 'weton']);

        // Upload foto jika disertakan
        if ($request->hasFile('foto')) {
            // Hapus foto lama jika ada
            if ($user->profile && $user->profile->foto && Storage::disk('public')->exists($user->profile->foto)) {
                Storage::disk('public')->delete($user->profile->foto);
            }

            $path = $request->file('foto')->store('profiles', 'public');
            $profileData['foto'] = $path;
        } elseif ($request->boolean('hapus_foto')) {
            // Hapus foto profil jika user meminta hapus foto
            if ($user->profile && $user->profile->foto && Storage::disk('public')->exists($user->profile->foto)) {
                Storage::disk('public')->delete($user->profile->foto);
            }
            $profileData['foto'] = null;
        }

        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $profileData
        );

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => $user->fresh()->load('profile'),
        ]);
    }

    // Mengubah kata sandi akun user yang sedang login
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'current_password.current_password' => 'Kata sandi saat ini tidak cocok.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui',
        ]);
    }
}
