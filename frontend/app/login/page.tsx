'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Email atau kata sandi tidak sesuai.');
        return;
      }

      // Successful login -> Redirect
      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMessage('Terjadi gangguan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090807] text-stone-100 px-6 py-8 sm:px-12 sm:py-10">
      {/* Top Header / Brand */}
      <header className="w-full max-w-7xl mx-auto">
        <Link href="/" className="inline-block group">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
            KhodamKu
          </span>
          {/* Subtle gold line bar below logo */}
          <div className="h-[2px] w-8 bg-[#d8b168] mt-1 group-hover:w-12 transition-all duration-300" />
        </Link>
      </header>

      {/* Main Content: 2 Columns */}
      <main className="w-full max-w-7xl mx-auto my-auto py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typography & Metrics */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow */}
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Inventaris Khodam
            </p>

            {/* Main Headline */}
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Sewa Khodam, <br />
              <span className="text-stone-100">Hidup Lebih Tenang.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-stone-400 max-w-xl leading-relaxed">
              Katalog, pemanggilan, dan pelepasan khodam — tercatat dalam satu sistem.
            </p>

            {/* Divider */}
            <div className="w-full border-t border-stone-800/80 my-8 sm:my-10" />

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  5 hari
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  masa kontrak gaib
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  2 unit
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  maksimal per raga
                </p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  Rp5.000
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  mahar per hari telat
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card Container */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="relative rounded-xl border border-stone-800/80 bg-[#12100e] p-7 sm:p-9 shadow-2xl transition-all">
              {/* Gold accent bar at top of card (matching screenshot) */}
              <div className="absolute top-0 left-0 w-20 h-[2px] bg-[#d8b168] rounded-tl-xl" />

              {/* Eyebrow */}
              <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
                Akses Anggota
              </p>

              {/* Title */}
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-white">
                Masuk
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-400">
                Gunakan akun yang sudah terdaftar.
              </p>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs text-red-300 animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pengamal@demo.test"
                    className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 text-sm text-white placeholder-stone-600 focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-stone-300 mb-1.5"
                  >
                    Kata sandi
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-stone-800 bg-[#090807] px-3.5 py-2.5 pr-10 text-sm text-white placeholder-stone-600 focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#d8b168] py-3 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors disabled:opacity-60 shadow-md active:scale-[0.99]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                    ) : (
                      'Masuk'
                    )}
                  </button>
                </div>
              </form>

              {/* Demo Accounts Section */}
              <div className="mt-8 pt-6 border-t border-stone-800/80">
                <p className="text-[10px] font-mono tracking-wider text-stone-500 uppercase mb-3">
                  Coba Akun Demo
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Juru Kunci Demo Box */}
                  <div
                    onClick={() => handleSelectDemo('admin@demo.test')}
                    className="cursor-pointer rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5 hover:border-amber-500/70 hover:bg-amber-950/40 transition-all group"
                  >
                    <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                      Mbah Darmo
                    </p>
                    <p className="text-[10px] text-stone-400">Juru Kunci (Admin)</p>
                  </div>

                  {/* Pengamal 1: Raka */}
                  <div
                    onClick={() => handleSelectDemo('pengamal@demo.test')}
                    className="cursor-pointer rounded-lg border border-stone-800/80 bg-stone-950/40 p-2.5 hover:border-stone-700 hover:bg-stone-900/60 transition-all group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Raka Pratama
                    </p>
                    <p className="text-[10px] text-stone-400">Pengamal &middot; Bandung</p>
                  </div>

                  {/* Pengamal 2: Bima */}
                  <div
                    onClick={() => handleSelectDemo('bima@khodamku.test')}
                    className="cursor-pointer rounded-lg border border-stone-800/80 bg-stone-950/40 p-2.5 hover:border-stone-700 hover:bg-stone-900/60 transition-all group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Bima Saputra
                    </p>
                    <p className="text-[10px] text-stone-400">Pengamal &middot; Solo</p>
                  </div>

                  {/* Pengamal 3: Sekar */}
                  <div
                    onClick={() => handleSelectDemo('sekar@khodamku.test')}
                    className="cursor-pointer rounded-lg border border-stone-800/80 bg-stone-950/40 p-2.5 hover:border-stone-700 hover:bg-stone-900/60 transition-all group"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                      Sekar Ayu
                    </p>
                    <p className="text-[10px] text-stone-400">Pengamal &middot; Sleman</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600 pt-6">
        <p>Sewa Khodam, Hidup Lebih Tenang.</p>
        <p>KhodamKu &middot; Kelompok 11</p>
      </footer>
    </div>
  );
}
