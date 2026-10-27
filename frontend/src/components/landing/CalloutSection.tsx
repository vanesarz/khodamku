'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function CalloutSection() {
  const { user } = useAuth();
  const targetHref = user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login';

  return (
    <section className="py-12 lg:py-16 bg-[#090807]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#12100e] shadow-2xl">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0">
            <Image
              src="/images/buku-catatan-bg.jpg"
              alt="Candi Borobudur stupa stone relief"
              fill
              className="object-cover object-right filter brightness-[0.6] contrast-[1.1]"
            />
            {/* Dark gradient to ensure high readability on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0c0b] via-[#0d0c0b]/90 to-transparent sm:w-3/4" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-16 sm:px-12 sm:py-20 lg:max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="KhodamKu"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-contain"
              />
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                Buku Catatan Gaib
              </span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Semua tercatat <br />
              di Buku Catatan Gaib.
            </h2>
            <p className="mt-4 text-sm text-stone-300 sm:text-base leading-relaxed">
              Riwayat pemanggilan, mahar, dan masa pelepasan tersimpan transparan dan aman.
            </p>
            <div className="mt-8">
              <Link
                href={targetHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-6 py-3 text-sm font-semibold text-stone-950 transition-all hover:bg-[#c99f52] shadow-lg shadow-amber-950/30 active:scale-[0.98]"
              >
                {user ? (
                  <>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Buka Dashboard</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke KhodamKu</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
