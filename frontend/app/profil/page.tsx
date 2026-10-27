'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, ChevronDown, Check, Loader2, X, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, getStorageUrl } from '@/lib/utils';

const WETON_OPTIONS = [
  'Selasa Pon',
  'Senin Kliwon',
  'Senin Legi',
  'Senin Pahing',
  'Senin Pon',
  'Senin Wage',
  'Selasa Kliwon',
  'Selasa Legi',
  'Selasa Pahing',
  'Selasa Wage',
  'Rabu Kliwon',
  'Rabu Legi',
  'Rabu Pahing',
  'Rabu Pon',
  'Rabu Wage',
  'Kamis Kliwon',
  'Kamis Legi',
  'Kamis Pahing',
  'Kamis Pon',
  'Kamis Wage',
  'Jumat Kliwon',
  'Jumat Legi',
  'Jumat Pahing',
  'Jumat Pon',
  'Jumat Wage',
  'Sabtu Kliwon',
  'Sabtu Legi',
  'Sabtu Pahing',
  'Sabtu Pon',
  'Sabtu Wage',
  'Minggu Kliwon',
  'Minggu Legi',
  'Minggu Pahing',
  'Minggu Pon',
  'Minggu Wage',
  'Kliwon',
  'Legi',
  'Pahing',
  'Pon',
  'Wage',
];

export default function ProfilPage() {
  const { user, refresh } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [noHp, setNoHp] = useState(user?.profile?.no_hp && user.profile.no_hp !== '-' ? user.profile.no_hp : '');
  const [tanggalLahir, setTanggalLahir] = useState(user?.profile?.tanggal_lahir || '');
  const [weton, setWeton] = useState(user?.profile?.weton && user.profile.weton !== '-' ? user.profile.weton : '');
  const [alamat, setAlamat] = useState(user?.profile?.alamat && user.profile.alamat !== '-' ? user.profile.alamat : '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hapusFoto, setHapusFoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State untuk ganti kata sandi
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.profile) {
        if (user.profile.no_hp && user.profile.no_hp !== '-') setNoHp(user.profile.no_hp);
        if (user.profile.alamat && user.profile.alamat !== '-') setAlamat(user.profile.alamat);
        if (user.profile.weton && user.profile.weton !== '-') setWeton(user.profile.weton);
        if (user.profile.tanggal_lahir) setTanggalLahir(user.profile.tanggal_lahir);
      }
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initials = getInitials(name);
  const roleLabel = user?.role === 'admin' ? 'Juru Kunci' : 'Pengamal';

  const serverPhotoUrl = getStorageUrl(user?.profile?.foto_url || user?.profile?.foto);
  const displayPhoto = hapusFoto ? null : (previewUrl || (imageError ? null : serverPhotoUrl));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Format foto harus berupa JPG, PNG, atau WEBP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file foto maksimal adalah 2 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setErrorMessage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHapusFoto(false);
    setImageError(false);
  };

  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('no_hp', noHp);
      formData.append('alamat', alamat);
      formData.append('weton', weton);
      if (tanggalLahir) formData.append('tanggal_lahir', tanggalLahir);

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }
      if (hapusFoto) {
        formData.append('hapus_foto', '1');
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Gagal menyimpan perubahan.');
        return;
      }

      setSuccessMessage('Profil berhasil diperbarui.');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setSelectedFile(null);
      setHapusFoto(false);
      setImageError(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage('Terjadi gangguan koneksi saat memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Kata sandi baru minimal harus 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(
          data.errors?.current_password?.[0] ||
          data.errors?.password?.[0] ||
          data.error ||
          'Gagal memperbarui kata sandi.'
        );
        return;
      }

      setPasswordSuccess('Kata sandi berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError('Terjadi gangguan koneksi saat mengubah kata sandi.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4">
          <HeaderDate />
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Akun
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Profil
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Data ini digunakan Juru Kunci saat menghubungimu terkait pelepasan.
            </p>
          </div>

          {/* Feedback Banners */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-in fade-in">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Two-Column Profile Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Avatar & Role Card */}
            <div className="lg:col-span-4 rounded-xl border border-stone-800/80 bg-[#12100e] p-8 flex flex-col items-center text-center shadow-xl">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Avatar circle with initials / photo & camera badge */}
              <div className="relative mb-4 group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Klik untuk memilih foto profil"
                  className="relative flex h-28 w-28 items-center justify-center rounded-full border border-stone-700 bg-stone-900 shadow-inner overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#d8b168] transition-all"
                >
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-stone-200">
                      {initials}
                    </span>
                  )}

                  {/* Hover hint overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Camera className="h-6 w-6 text-[#d8b168]" />
                    <span className="text-[10px] font-semibold text-stone-200 mt-1">
                      {displayPhoto ? 'Ganti Foto' : 'Pilih Foto'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ganti foto profil"
                  className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700 bg-stone-800 text-stone-300 hover:bg-[#d8b168] hover:text-stone-950 hover:border-[#d8b168] transition-all shadow-md z-10"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Photo selection / deletion status actions */}
              {previewUrl && (
                <div className="mb-3 flex items-center gap-1.5 animate-in fade-in">
                  <span className="text-[11px] text-amber-400 font-medium">Foto baru dipilih</span>
                  <button
                    type="button"
                    onClick={handleCancelPreview}
                    className="inline-flex items-center gap-1 rounded bg-stone-800/80 px-2 py-0.5 text-[10px] text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Batal</span>
                  </button>
                </div>
              )}

              {hapusFoto && (
                <div className="mb-3 flex items-center gap-1.5 animate-in fade-in">
                  <span className="text-[11px] text-red-400 font-medium">Foto akan dihapus</span>
                  <button
                    type="button"
                    onClick={() => setHapusFoto(false)}
                    className="inline-flex items-center gap-1 rounded bg-stone-800/80 px-2 py-0.5 text-[10px] text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Batal hapus</span>
                  </button>
                </div>
              )}

              {!previewUrl && !hapusFoto && serverPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setHapusFoto(true)}
                  className="mb-3 inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Hapus foto profil</span>
                </button>
              )}

              {/* Identity */}
              <h2 className="text-base font-bold text-white">
                {name}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {email}
              </p>

              {/* Role pill badge */}
              <div className="mt-3 inline-flex items-center rounded-full border border-stone-800 bg-stone-900/60 px-3 py-1 text-xs font-medium text-stone-300">
                {roleLabel}
              </div>

              {/* Photo Upload Note */}
              <p className="mt-8 text-[11px] text-stone-500">
                JPG, PNG, atau WEBP &middot; maks. 2 MB
              </p>
            </div>

            {/* Right Column: Profile Form & Password Security */}
            <div className="lg:col-span-8 space-y-8">
              {/* Profile Data Card */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-7 sm:p-9 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nama Lengkap */}
                    <div>
                      <label
                        htmlFor="nama"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Nama lengkap
                      </label>
                      <input
                        id="nama"
                        type="text"
                        disabled
                        value={name}
                        className="w-full rounded-lg border border-stone-800/80 bg-stone-950/60 px-3.5 py-2.5 text-xs sm:text-sm text-stone-300 cursor-not-allowed select-none"
                      />
                      <p className="mt-1 text-[10px] text-stone-500">
                        Hubungi Juru Kunci untuk mengubah nama.
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        disabled
                        value={email}
                        className="w-full rounded-lg border border-stone-800/80 bg-stone-950/60 px-3.5 py-2.5 text-xs sm:text-sm text-stone-300 cursor-not-allowed select-none"
                      />
                    </div>

                    {/* Nomor HP */}
                    <div>
                      <label
                        htmlFor="nomor-hp"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Nomor HP
                      </label>
                      <input
                        id="nomor-hp"
                        type="text"
                        required
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        placeholder="085712345678"
                        className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                      />
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label
                        htmlFor="tanggal-lahir"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Tanggal lahir
                      </label>
                      <input
                        id="tanggal-lahir"
                        type="date"
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                      />
                    </div>

                    {/* Weton */}
                    <div>
                      <label
                        htmlFor="weton"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Weton
                      </label>
                      <div className="relative">
                        <select
                          id="weton"
                          value={weton}
                          onChange={(e) => setWeton(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors cursor-pointer"
                        >
                          {WETON_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      </div>
                      <p className="mt-1 text-[10px] text-stone-500">
                        Hari dan pasaran kelahiran.
                      </p>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label
                        htmlFor="alamat"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Alamat
                      </label>
                      <textarea
                        id="alamat"
                        required
                        rows={3}
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Jl. Dago Asri No. 21, Bandung"
                        className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Form Footer Action */}
                  <div className="pt-6 border-t border-stone-800/80 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-6 py-2.5 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors disabled:opacity-60 shadow-md active:scale-[0.99]"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin text-stone-950" />}
                      <span>Simpan perubahan</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Password / Security Form Card */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-7 sm:p-9 shadow-xl">
                <div className="mb-6 border-b border-stone-800/80 pb-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-[#d8b168]" />
                    <h2 className="text-base font-bold text-white">
                      Keamanan &amp; Kata Sandi
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-stone-400">
                    Ganti kata sandi akunmu secara berkala untuk menjaga keamanan raga dan akses padepokan.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-3 text-xs text-emerald-300 animate-in fade-in">
                    <Check className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Kata Sandi Saat Ini */}
                  <div>
                    <label
                      htmlFor="current-password"
                      className="block text-xs font-medium text-stone-300 mb-1.5"
                    >
                      Kata sandi saat ini
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan kata sandi saat ini"
                        className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Kata Sandi Baru */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Kata sandi baru
                      </label>
                      <div className="relative">
                        <input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[10px] text-stone-500">
                        Minimal 8 karakter, kombinasi huruf &amp; angka.
                      </p>
                    </div>

                    {/* Konfirmasi Kata Sandi Baru */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="block text-xs font-medium text-stone-300 mb-1.5"
                      >
                        Konfirmasi kata sandi baru
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi kata sandi baru"
                          className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 transition-colors p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && newPassword !== confirmPassword && (
                        <p className="mt-1 text-[10px] text-red-400 animate-in fade-in">
                          Konfirmasi kata sandi belum cocok.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Footer Action */}
                  <div className="pt-5 border-t border-stone-800/80 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 rounded-lg bg-stone-800 border border-stone-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-stone-100 hover:bg-stone-700 hover:border-stone-600 transition-colors disabled:opacity-60 shadow-md active:scale-[0.99]"
                    >
                      {passwordSaving && <Loader2 className="h-4 w-4 animate-spin text-[#d8b168]" />}
                      <KeyRound className="h-3.5 w-3.5 text-[#d8b168]" />
                      <span>Ubah Kata Sandi</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
