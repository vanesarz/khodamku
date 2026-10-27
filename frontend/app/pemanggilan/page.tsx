'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Phone,
  ArrowRight,
  Plus,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  FileCheck2,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import KhodamDetailModal from '@/components/landing/KhodamDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { Khodam } from '@/types';
import { getAnchoredTransactions, calculateDueDateStatus, formatDateFull } from '@/lib/dateUtils';

export default function PemanggilanPage() {
  const { user } = useAuth();
  const [selectedKhodam, setSelectedKhodam] = useState<Khodam | null>(null);
  const [invocations, setInvocations] = useState<any[]>([]);
  const [anchoredList, setAnchoredList] = useState<any[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Release Request Modal state
  const [releasingContract, setReleasingContract] = useState<any | null>(null);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/pemanggilan');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setInvocations(json.data);
        }
      }
    } catch (err) {
      console.warn('Could not load pemanggilan:', err);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    setAnchoredList(getAnchoredTransactions());
    loadData();
  }, [user, loadData]);

  // Compute active & pending contracts for this user anchored to real Today
  const activeContracts = useMemo(() => {
    const isOngoingStatus = (statusStr: string) => {
      const s = String(statusStr || '').toLowerCase().trim();
      return (
        s === 'aktif' ||
        s === 'terlambat' ||
        s === 'menunggu persetujuan' ||
        s === 'menunggu_persetujuan' ||
        s === 'menunggu pelepasan' ||
        s === 'menunggu_pelepasan'
      );
    };

    if (!hasLoaded) {
      const emailLower = user?.email?.toLowerCase() || '';
      let userTransactions: any[] = [];
      if (emailLower.includes('sekar')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('sekar'));
      } else if (emailLower.includes('bima')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('bima'));
      } else if (emailLower.includes('raka') || emailLower.includes('pengamal@khodamku.test')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('raka'));
      } else {
        userTransactions = [];
      }
      return userTransactions.filter((t) => isOngoingStatus(t.status));
    }

    return invocations.filter((i) => isOngoingStatus(i.status));
  }, [invocations, user, anchoredList, hasLoaded]);

  const activeCount = activeContracts.length;
  const maxSlots = 2;

  // Handle pengamal requesting release
  const handleConfirmRequestLepas = async () => {
    if (!releasingContract) return;

    setIsSubmittingRelease(true);
    try {
      const res = await fetch(`/api/pemanggilan/${releasingContract.id}/request-lepas`, {
        method: 'POST',
      });
      const json = await res.json();

      if (res.ok) {
        setNotification({
          type: 'success',
          message:
            json.message ||
            `Permintaan pelepasan khodam ${releasingContract.khodam?.nama} berhasil diajukan! Menunggu konfirmasi Juru Kunci.`,
        });
        setReleasingContract(null);
        await loadData();
      } else {
        setNotification({
          type: 'error',
          message: json.error || 'Gagal mengajukan pelepasan khodam.',
        });
      }
    } catch (err) {
      console.error('Error requesting lepas:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi gangguan gaib saat mengajukan pelepasan.',
      });
    } finally {
      setIsSubmittingRelease(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar with dynamic real date */}
        <header className="border-b border-stone-800/80 px-8 py-4">
          <HeaderDate />
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Pemanggilan Saya
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Kontrak gaib berjalan
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              {activeCount} dari {maxSlots} slot raga terpakai. Semua pemanggilan dan pelepasan khodam memerlukan persetujuan Juru Kunci.
            </p>
          </div>

          {/* Notification Banner */}
          {notification && (
            <div
              className={`mb-6 flex items-center justify-between rounded-xl border p-4 text-xs animate-in fade-in duration-300 ${
                notification.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                  : 'border-red-500/30 bg-red-950/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-stone-400 hover:text-white transition-colors ml-4"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Active / Pending Contract Cards */}
          {activeContracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-800 p-12 text-center max-w-xl">
              <p className="text-sm font-medium text-stone-400">
                Saat ini tidak ada khodam yang sedang bersemayam atau diajukan di ragamu.
              </p>
              <Link
                href="/katalog"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#d8b168] px-4 py-2 text-xs font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors"
              >
                <span>Pilih di katalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {activeContracts.map((contract) => {
                const statusStr = String(contract.status || '').toLowerCase().trim();
                const isPendingSummon = statusStr === 'menunggu persetujuan' || statusStr === 'menunggu_persetujuan';
                const isPendingRelease = statusStr === 'menunggu pelepasan' || statusStr === 'menunggu_pelepasan';

                const rawDue = contract.tgl_jatuh_tempo_raw || contract.tgl_jatuh_tempo;
                const statusInfo = calculateDueDateStatus(rawDue);

                const progressWidth = isPendingSummon
                  ? '30%'
                  : isPendingRelease
                    ? '100%'
                    : statusInfo.isTerlambat
                      ? '100%'
                      : statusInfo.isHariIni
                        ? '90%'
                        : `${Math.max(20, 100 - Math.abs(statusInfo.diffDays) * 20)}%`;

                const sigil = contract.khodam?.kode_khodam?.split('-')[1] || contract.khodam?.sigil || 'KHD';

                return (
                  <div
                    key={contract.id}
                    className="rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl transition-all duration-300 hover:border-stone-700 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header: Sigil + Info + Badge */}
                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() =>
                            setSelectedKhodam({
                              id: contract.khodam?.id || 1,
                              nama: contract.khodam?.nama || '',
                              kode_khodam: contract.khodam?.kode_khodam || '',
                              asal: contract.khodam?.asal || 'Tanah Jawa',
                              level_kekuatan: contract.khodam?.level_kekuatan || 4,
                              deskripsi:
                                contract.khodam?.deskripsi ||
                                'Entitas gaib pelindung yang setia menjaga raga pengamal.',
                              foto: null,
                              status: isPendingSummon ? 'Menunggu Dipanggil' : 'Sedang Bersemayam',
                              is_tersedia: false,
                              kategoris: [],
                            })
                          }
                        >
                          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 shadow-inner">
                            <div className="absolute inset-1 rounded-full border border-stone-800/80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="h-full w-[1px] bg-stone-800/50" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-[1px] bg-stone-800/50" />
                            </div>
                            <span className="font-mono text-xs font-bold text-stone-200 z-10">
                              {sigil}
                            </span>
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-white hover:text-amber-300 transition-colors">
                              {contract.khodam?.nama}
                            </h2>
                            <p className="text-[10px] font-mono text-stone-500 uppercase">
                              {contract.khodam?.kode_khodam} &middot; {contract.kode_transaksi}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isPendingSummon ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Menunggu Persetujuan</span>
                          </span>
                        ) : isPendingRelease ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span>Menunggu Pelepasan</span>
                          </span>
                        ) : (
                          <span
                            className={`text-xs font-semibold ${
                              statusInfo.isTerlambat
                                ? 'text-amber-500'
                                : statusInfo.isHariIni
                                  ? 'text-amber-400'
                                  : 'text-stone-400'
                            }`}
                          >
                            {statusInfo.statusText}
                          </span>
                        )}
                      </div>

                      {/* Timeline Progress Bar */}
                      <div className="mt-5 mb-5">
                        <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isPendingSummon
                                ? 'bg-amber-400/60 animate-pulse'
                                : isPendingRelease
                                  ? 'bg-sky-400'
                                  : statusInfo.isTerlambat
                                    ? 'bg-amber-500'
                                    : 'bg-white'
                            }`}
                            style={{ width: progressWidth }}
                          />
                        </div>
                      </div>

                      {/* Three Metrics Details */}
                      <div className="grid grid-cols-3 gap-4 pt-1">
                        <div>
                          <p className="text-[10px] uppercase text-stone-500">
                            {isPendingSummon ? 'Diajukan' : 'Dipanggil'}
                          </p>
                          <p className="text-xs font-semibold text-white mt-1">
                            {formatDateFull(contract.tgl_panggil_raw || contract.tgl_panggil)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-stone-500">
                            {isPendingSummon ? 'Estimasi Tempo' : 'Jatuh tempo'}
                          </p>
                          <p className="text-xs font-semibold text-white mt-1">
                            {formatDateFull(contract.tgl_jatuh_tempo_raw || contract.tgl_jatuh_tempo)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-stone-500">
                            Estimasi mahar
                          </p>
                          <p className="text-xs font-semibold text-white mt-1">
                            {isPendingSummon ? 'Rp0' : statusInfo.maharFormatted}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Status & Action Row */}
                    <div className="mt-6 pt-3.5 border-t border-stone-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
                      <div>
                        {isPendingSummon ? (
                          <span className="text-amber-300/90 font-medium flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Permohonan sedang ditelaah Juru Kunci.</span>
                          </span>
                        ) : isPendingRelease ? (
                          <span className="text-sky-300 font-medium flex items-center gap-1.5">
                            <FileCheck2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                            <span>Permintaan pelepasan diajukan, menunggu approval.</span>
                          </span>
                        ) : statusInfo.isTerlambat ? (
                          <span className="text-amber-400 font-medium flex items-center gap-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Melewati tempo {Math.abs(statusInfo.diffDays)} hari.</span>
                          </span>
                        ) : statusInfo.isHariIni ? (
                          <span className="text-stone-300 font-medium">Kontrak gaib berakhir hari ini.</span>
                        ) : (
                          <span>Kontrak gaib berakhir {statusInfo.statusText}.</span>
                        )}
                      </div>

                      {/* Action: Ajukan Pelepasan if Active or Terlambat */}
                      {!isPendingSummon && !isPendingRelease && (
                        <button
                          type="button"
                          onClick={() => setReleasingContract(contract)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/20 px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-900/40 transition-colors cursor-pointer shrink-0"
                        >
                          <span>Ajukan Pelepasan</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty Slot Card for Pengamal */}
              {activeContracts.length < maxSlots && (
                <Link
                  href="/katalog"
                  className="group rounded-xl border-2 border-dashed border-stone-800 bg-[#12100e]/40 p-6 flex flex-col items-center justify-center text-center hover:border-[#d8b168]/70 hover:bg-[#12100e] transition-all min-h-[260px]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-stone-400 group-hover:border-[#d8b168]/60 group-hover:text-[#d8b168] transition-colors mb-3">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-white group-hover:text-[#d8b168] transition-colors">
                    Slot Raga Kosong ({activeContracts.length}/{maxSlots})
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-[210px] leading-relaxed">
                    Kapasitas raga masih tersedia. Ajukan permohonan pemanggilan khodam baru dari katalog gaib.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#d8b168] px-3.5 py-1.5 text-xs font-bold text-stone-950 group-hover:bg-[#c99f52] transition-colors">
                    <span>Ajukan Pemanggilan</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Workflow Explanation Banner */}
          <div className="mt-8 max-w-3xl rounded-xl border border-stone-800/80 bg-[#12100e] p-5 shadow-lg flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-[#d8b168]">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Alur Persetujuan Resmi Juru Kunci
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Demi menjaga keselarasan raga dan alam gaib, semua peminjaman/pemanggilan dan pengembalian/pelepasan khodam wajib diajukan terlebih dahulu dan disetujui resmi oleh Juru Kunci (Admin Padepokan).
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Interactive Detail Modal */}
      <KhodamDetailModal
        khodam={selectedKhodam}
        onClose={() => setSelectedKhodam(null)}
      />

      {/* Confirmation Modal for Requesting Lepas */}
      {releasingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-800 bg-[#141210] p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setReleasingContract(null)}
              disabled={isSubmittingRelease}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-950/20 text-sm font-extrabold text-amber-300">
                {releasingContract.khodam?.kode_khodam?.split('-')[1] || 'KHD'}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-amber-500 tracking-wider">
                  Permohonan Pelepasan
                </p>
                <h3 className="text-lg font-bold text-white">
                  Lepas {releasingContract.khodam?.nama}?
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed bg-stone-900/50 rounded-xl p-3.5 border border-stone-800/80 mb-5">
              Kamu akan mengajukan permohonan pelepasan khodam ini kepada Juru Kunci. Setelah diajukan, status kontrak akan berubah menjadi <span className="font-semibold text-amber-300">Menunggu Pelepasan</span> dan Juru Kunci akan mengesahkan ritual pelepasan serta mencatat mahar akhir.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReleasingContract(null)}
                disabled={isSubmittingRelease}
                className="rounded-lg px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRequestLepas}
                disabled={isSubmittingRelease}
                className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-4 py-2 text-xs font-bold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingRelease ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-950" />
                    <span>Mengirim Permohonan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Ajukan Pelepasan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
