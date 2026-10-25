'use client';

import { X, Sparkles, MapPin, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import { Khodam } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface KhodamDetailModalProps {
  khodam: Khodam | null;
  onClose: () => void;
  onPanggil?: (khodam: Khodam) => void;
}

export default function KhodamDetailModal({
  khodam,
  onClose,
  onPanggil,
}: KhodamDetailModalProps) {
  const { user } = useAuth();

  if (!khodam) return null;

  const isAvailable = khodam.status === 'Menunggu Dipanggil' && khodam.is_tersedia !== false;
  const isPengamal = user && user.role !== 'admin';
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-800 bg-[#141210] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with sigil circle */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/20 text-lg font-extrabold text-amber-300 shadow-inner">
            {khodam.kode_khodam.split('-')[1] || 'KHD'}
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">
              {khodam.kode_khodam}
            </span>
            <h3 className="text-2xl font-extrabold text-white">
              {khodam.nama}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-400">
              <MapPin className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
              <span>{khodam.asal}</span>
            </div>
          </div>
        </div>

        {/* Level & Status */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-stone-800/80 py-4">
          <div>
            <p className="text-[11px] text-stone-500 uppercase tracking-wider">
              Level Kekuatan
            </p>
            <div className="mt-1.5 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <span
                  key={lvl}
                  className={`h-2 w-4 rounded-xs ${
                    lvl <= khodam.level_kekuatan
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                      : 'bg-stone-800'
                  }`}
                />
              ))}
              <span className="ml-1.5 text-xs font-semibold text-amber-300">
                {khodam.level_kekuatan}/5
              </span>
            </div>
          </div>

          <div>
            <p className="text-[11px] text-stone-500 uppercase tracking-wider">
              Status Entitas
            </p>
            {isAvailable ? (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-emerald-950/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Menunggu Dipanggil</span>
              </div>
            ) : (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-amber-900/60 bg-amber-950/40 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span>Sedang Bersemayam</span>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mt-4">
          <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-2">
            Kategori Hajat
          </p>
          <div className="flex flex-wrap gap-1.5">
            {khodam.kategoris.map((kat) => (
              <span
                key={kat.id}
                className="rounded-md border border-stone-700/60 bg-stone-900/80 px-2.5 py-1 text-xs text-stone-300"
              >
                {kat.nama}
              </span>
            ))}
          </div>
        </div>

        {/* Lore / Description */}
        <div className="mt-4">
          <p className="text-[11px] text-stone-500 uppercase tracking-wider mb-1.5">
            Hikayat & Tuah
          </p>
          <p className="text-sm text-stone-300 leading-relaxed bg-stone-900/40 rounded-xl p-3 border border-stone-800/60">
            {khodam.deskripsi}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            Tutup
          </button>

          {/* Conditional Action Buttons */}
          {isPengamal ? (
            isAvailable ? (
              <button
                type="button"
                onClick={() => {
                  if (onPanggil) {
                    onPanggil(khodam);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-lg shadow-amber-950/40 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Panggil Khodam Ini</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900/60 px-4 py-2.5 text-xs font-semibold text-stone-500 cursor-not-allowed"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Sedang Bersemayam</span>
              </button>
            )
          ) : isAdmin ? (
            <Link
              href="/admin/pemanggilan"
              className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/40 transition-colors"
            >
              <span>Portal Juru Kunci</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-xs font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors"
            >
              <span>Panggil Lewat Juru Kunci</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
