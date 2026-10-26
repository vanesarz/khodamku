'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles, AlertCircle, CheckCircle2, Calendar, Shield, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Khodam } from '@/types';
import { getStartOfToday, addDays, formatDateFull } from '@/lib/dateUtils';

interface RitualPemanggilanModalProps {
  khodam: Khodam | null;
  onClose: () => void;
  onSuccess?: () => void;
  currentActiveCount: number;
}

export default function RitualPemanggilanModal({
  khodam,
  onClose,
  onSuccess,
  currentActiveCount,
}: RitualPemanggilanModalProps) {
  const router = useRouter();
  const [durasiHari, setDurasiHari] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ritualSuccessData, setRitualSuccessData] = useState<any>(null);

  if (!khodam) return null;

  const today = getStartOfToday();
  const tglPanggilFormatted = formatDateFull(today);
  const tglJatuhTempoFormatted = formatDateFull(addDays(today, durasiHari));
  const isSlotFull = currentActiveCount >= 2;
  const sigil = khodam.kode_khodam.split('-')[1] || 'KHD';

  const handleStartRitual = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/pemanggilan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          khodam_id: khodam.id,
          durasi_hari: durasiHari,
          khodam_data: khodam,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal menyempurnakan ritual pemanggilan');
        setIsSubmitting(false);
        return;
      }

      setRitualSuccessData(data.data);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Ritual error:', err);
      setErrorMsg('Terjadi gangguan spiritual saat memproses pemanggilan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-stone-800 bg-[#141210] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 1. SUCCESS VIEW */}
        {isSuccess ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)] mb-4 animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>

            <p className="text-xs font-semibold tracking-wider text-[#d8b168] uppercase">
              Ritual Disempurnakan
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">
              Khodam Berhasil Dipanggil!
            </h2>
            <p className="mt-2 text-xs text-stone-300 max-w-sm mx-auto leading-relaxed">
              Energi gaib <span className="font-bold text-amber-300">{khodam.nama}</span> ({khodam.kode_khodam}) kini telah menyatu dan bersemayam di ragamu.
            </p>

            {/* Summary card */}
            <div className="my-6 rounded-xl border border-stone-800/80 bg-stone-950/70 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Tanggal Pemanggilan</span>
                <span className="font-medium text-stone-200">{tglPanggilFormatted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Jatuh Tempo Kontrak</span>
                <span className="font-bold text-amber-300">{tglJatuhTempoFormatted}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-stone-800/80">
                <span className="text-stone-400">Status Entitas</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sedang Bersemayam</span>
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/pemanggilan');
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-lg shadow-amber-950/40"
              >
                <span>Lihat di Pemanggilan Saya</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-lg border border-stone-800 bg-stone-900/60 px-4 py-2.5 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                Tetap di Katalog
              </button>
            </div>
          </div>
        ) : (
          /* 2. RITUAL FORM VIEW */
          <div>
            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-950/20 text-base font-extrabold text-amber-300 shadow-inner">
                {sigil}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#d8b168] uppercase">
                  Ritual Pemanggilan
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Panggil {khodam.nama}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  {khodam.kode_khodam} &middot; {khodam.asal}
                </p>
              </div>
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Slot check warning if slot full */}
            {isSlotFull ? (
              <div className="mt-6 rounded-xl border border-amber-900/50 bg-amber-950/20 p-4 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertCircle className="h-4 w-4" />
                  <span>Batas Raga Penuh (2/2 Slot Terpakai)</span>
                </div>
                <p className="text-stone-300 leading-relaxed">
                  Ragamu saat ini sudah menampung kapasitas maksimal 2 khodam aktif secara bersamaan. Hubungi Juru Kunci untuk melepaskan salah satu khodam terlebih dahulu sebelum bisa memanggil entitas baru.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/pemanggilan');
                  }}
                  className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold underline text-xs"
                >
                  <span>Buka Pemanggilan Saya</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : (
              /* Slot Available: Ritual parameters */
              <div className="mt-6 space-y-4">
                {/* Slot quota pill */}
                <div className="flex items-center justify-between text-xs rounded-lg border border-stone-800 bg-stone-900/40 px-3.5 py-2">
                  <span className="text-stone-400">Kapasitas Raga Tersedia:</span>
                  <span className="font-semibold text-emerald-400">
                    {2 - currentActiveCount} dari 2 slot kosong
                  </span>
                </div>

                {/* Duration options */}
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-2">
                    Pilih Durasi Kontrak Gaib
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { days: 3, label: '3 Hari', note: 'Singkat' },
                      { days: 5, label: '5 Hari', note: 'Standar' },
                      { days: 7, label: '7 Hari', note: 'Purnama' },
                    ].map((opt) => {
                      const isSelected = durasiHari === opt.days;
                      return (
                        <button
                          key={opt.days}
                          type="button"
                          onClick={() => setDurasiHari(opt.days)}
                          className={`rounded-xl border p-3 text-center transition-all ${
                            isSelected
                              ? 'border-[#d8b168] bg-[#d8b168]/10 text-white shadow-[0_0_12px_rgba(216,177,104,0.15)]'
                              : 'border-stone-800 bg-[#12100e] text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          }`}
                        >
                          <span className="block text-sm font-bold">{opt.label}</span>
                          <span className="block text-[10px] text-stone-500 mt-0.5">
                            {opt.note}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & Terms details box */}
                <div className="rounded-xl border border-stone-800/80 bg-stone-950/60 p-4 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-stone-500" />
                      <span>Mulai Dipanggil</span>
                    </span>
                    <span className="font-semibold text-white">{tglPanggilFormatted}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-stone-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-500/80" />
                      <span>Jatuh Tempo</span>
                    </span>
                    <span className="font-bold text-amber-300">{tglJatuhTempoFormatted}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-stone-800/80">
                    <span className="text-stone-400">Mahar Pemanggilan Awal</span>
                    <span className="font-bold text-emerald-400">Gratis (Rp0)</span>
                  </div>
                </div>

                {/* Spiritual reminder */}
                <p className="text-[11px] text-stone-500 leading-relaxed italic">
                  * Setelah ritual selesai, khodam akan mendampingi ragamu selama {durasiHari} hari. Pelepasan sebelum atau setelah tempo dilakukan melalui Juru Kunci.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-7 flex items-center justify-end gap-3 pt-3 border-t border-stone-800/80">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                Batal
              </button>

              {!isSlotFull && (
                <button
                  type="button"
                  onClick={handleStartRitual}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-xs font-bold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-stone-950" />
                      <span>Merapalkan Mantra...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Mulai Ritual Pemanggilan</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
