'use client';

import { X, AlertCircle, Loader2 } from 'lucide-react';

interface PemanggilanRecord {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  khodam: {
    nama: string;
    kode_khodam: string;
    sigil: string;
  };
  tgl_panggil: string;
  tgl_jatuh_tempo: string;
  status_badge: string;
  estimasi_mahar: string;
  is_terlambat: boolean;
}

interface LepasKhodamModalProps {
  item: PemanggilanRecord | null;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  loading: boolean;
}

export default function LepasKhodamModal({
  item,
  onClose,
  onConfirm,
  loading,
}: LepasKhodamModalProps) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-800 bg-[#141210] p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Pelepasan Khodam
            </h3>
            <p className="text-xs text-stone-400">
              Konfirmasi pelepasan entitas dari raga pengamal.
            </p>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="rounded-xl border border-stone-800/80 bg-stone-950/60 p-4 space-y-2.5 my-5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-mono">Kode Transaksi</span>
            <span className="font-mono text-stone-300">{item.kode_transaksi}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Khodam</span>
            <span className="font-bold text-white">{item.khodam.nama}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Pengamal</span>
            <span className="text-stone-300">{item.pengamal}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Jatuh Tempo</span>
            <span className="text-stone-300">{item.tgl_jatuh_tempo}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-stone-800/80">
            <span className="text-stone-400 font-medium">Status & Mahar</span>
            <div className="text-right">
              <span className={`block font-semibold ${item.is_terlambat ? 'text-amber-500' : 'text-stone-300'}`}>
                {item.status_badge}
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {item.estimasi_mahar}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2.5 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(item.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-xs font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors disabled:opacity-60 shadow-md active:scale-[0.99]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin text-stone-950" />}
            <span>Konfirmasi Pelepasan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
