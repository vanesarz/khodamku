import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-stone-800 bg-stone-900/70 backdrop-blur-sm self-start">
              <Image
                src="/images/logo.png"
                alt="KhodamKu"
                width={18}
                height={18}
                className="h-4.5 w-4.5 rounded-full object-contain"
              />
              <span className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                Platform Sewa Khodam Resmi
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
              Sewa Khodam, <br />
              <span className="text-stone-100">Hidup Lebih Tenang.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base text-stone-400 sm:text-lg leading-relaxed max-w-xl">
              Temukan khodam pendamping sesuai kebutuhan spiritualmu. Cepat, aman, terpercaya langsung dikendalikan lewat Juru Kunci. Semua tercatat di Buku Catatan Gaib.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#katalog"
                className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-6 py-3 text-sm font-semibold text-stone-950 transition-all hover:bg-[#c99f52] shadow-lg shadow-amber-950/20 active:scale-[0.98]"
              >
                <span>Mulai Memanggil</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#katalog"
                className="inline-flex items-center gap-2 text-sm font-medium text-stone-300 underline underline-offset-8 transition-colors hover:text-amber-300 px-2 py-3"
              >
                Lihat Katalog
              </Link>
            </div>

            {/* Live Indicator */}
            <div className="mt-10 flex items-center gap-2 text-xs text-stone-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>8 khodam siap dipanggil</span>
            </div>
          </div>

          {/* Right Column: Hero Visual with Temple & Floating Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-800/80 bg-stone-950 shadow-2xl">
              <Image
                src="/images/hero-candi.jpg"
                alt="Candi Prambanan mistis berkabut di senja hari"
                fill
                priority
                className="object-cover object-center filter brightness-[0.88] contrast-[1.08]"
              />
              {/* Subtle mystical vignette gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090807] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090807]/40 via-transparent to-transparent" />

              {/* Floating Khodam Status Card (bottom right, matching screenshot) */}
              <div className="absolute bottom-5 right-5 left-5 sm:left-auto sm:max-w-xs rounded-xl border border-stone-700/60 bg-stone-950/85 p-3.5 backdrop-blur-md shadow-xl transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-950/40 text-xs font-bold text-amber-300">
                    NGH
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="truncate text-xs font-semibold text-white">
                        Naga Hijau
                      </p>
                      <span className="shrink-0 text-[10px] font-medium text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        Tersedia
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-stone-400">
                      Telaga Sarangan, Magetan
                    </p>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Level Kekuatan: 5/5</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="h-2 w-1 rounded-sm bg-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
