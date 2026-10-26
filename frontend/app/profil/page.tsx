'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

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

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const initials = getInitials(name);
  const roleLabel = user?.role === 'admin' ? 'Juru Kunci' : 'Pengamal';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          no_hp: noHp,
          alamat,
          weton,
          tanggal_lahir: tanggalLahir || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Gagal menyimpan perubahan.');
        return;
      }

      setSuccessMessage('Profil berhasil diperbarui.');
      refresh();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage('Terjadi gangguan koneksi saat memperbarui profil.');
    } finally {
      setSaving(false);
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
              {/* Avatar circle with initials & camera badge */}
              <div className="relative mb-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-stone-700 bg-stone-900 shadow-inner">
                  <span className="text-3xl font-extrabold text-stone-200">
                    {initials}
                  </span>
                </div>
              </div>

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
            </div>

            {/* Right Column: Profile Form */}
            <div className="lg:col-span-8 rounded-xl border border-stone-800/80 bg-[#12100e] p-7 sm:p-9 shadow-xl">
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
          </div>
        </main>
      </div>
    </div>
  );
}
