'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Phone, ArrowRight, Plus } from 'lucide-react';
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

  useEffect(() => {
    setAnchoredList(getAnchoredTransactions());
    const loadData = async () => {
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
    };
    loadData();
  }, [user]);

  // Compute active contracts for this user anchored to real Today
  const activeContracts = useMemo(() => {
    if (!hasLoaded) {
      const emailLower = user?.email?.toLowerCase() || '';
      let userTransactions: any[] = [];
      if (emailLower.includes('sekar')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('sekar'));
      } else if (emailLower.includes('bima')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('bima'));
      } else if (emailLower.includes('raka') || emailLower.includes('pengamal@demo.test')) {
        userTransactions = anchoredList.filter((t) => t.pengamal_email.toLowerCase().includes('raka'));
      } else {
        userTransactions = [];
      }
      return userTransactions.filter((t) => t.status === 'Aktif' || t.status === 'Terlambat');
    }

    return invocations.filter((i) => {
      const s = String(i.status || '').toLowerCase();
      return s === 'aktif' || s === 'terlambat';
    });
  }, [invocations, user, anchoredList, hasLoaded]);

  const activeCount = activeContracts.length;
  const maxSlots = 2;

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
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Pemanggilan Saya
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Kontrak gaib berjalan
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              {activeCount} dari {maxSlots} slot raga terpakai. Hitung mundur dihitung dari tanggal jatuh tempo.
            </p>
          </div>

          {/* Active Contract Cards */}
          {activeContracts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-800 p-12 text-center max-w-xl">
              <p className="text-sm font-medium text-stone-400">
                Saat ini tidak ada khodam yang sedang bersemayam di ragamu.
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
                const rawDue = contract.tgl_jatuh_tempo_raw || contract.tgl_jatuh_tempo;
                const statusInfo = calculateDueDateStatus(rawDue);

                const progressWidth = statusInfo.isTerlambat
                  ? '100%'
                  : statusInfo.isHariIni
                  ? '90%'
                  : `${Math.max(20, 100 - Math.abs(statusInfo.diffDays) * 20)}%`;

                const sigil = contract.khodam?.kode_khodam?.split('-')[1] || contract.khodam?.sigil || 'KHD';

                return (
                  <div
                    key={contract.id}
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
                        status: 'Sedang Bersemayam',
                        is_tersedia: false,
                        kategoris: [],
                      })
                    }
                    className="cursor-pointer rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl transition-all duration-300 hover:border-stone-700 flex flex-col justify-between"
                  >
                    <div>
                      {/* Header: Sigil + Info + Remaining countdown */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
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
                            <h2 className="text-sm font-bold text-white">
                              {contract.khodam?.nama}
                            </h2>
                            <p className="text-[10px] font-mono text-stone-500 uppercase">
                              {contract.khodam?.kode_khodam}
                            </p>
                          </div>
                        </div>

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
                      </div>

                      {/* Timeline Progress Bar */}
                      <div className="mt-5 mb-5">
                        <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              statusInfo.isTerlambat ? 'bg-amber-500' : 'bg-white'
                            }`}
                            style={{ width: progressWidth }}
                          />
                        </div>
                      </div>

                      {/* Three Metrics Details */}
                      <div className="grid grid-cols-3 gap-4 pt-1">
                        <div>
                          <p className="text-[10px] uppercase text-stone-500">
                            Dipanggil
                          </p>
                          <p className="text-xs font-semibold text-white mt-1">
                            {formatDateFull(contract.tgl_panggil_raw || contract.tgl_panggil)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-stone-500">
                            Jatuh tempo
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
                            {statusInfo.maharFormatted}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom status caption */}
                    <div className="mt-6 pt-3 border-t border-stone-800/60 text-xs text-stone-400">
                      {statusInfo.isTerlambat
                        ? `Melewati tempo ${Math.abs(statusInfo.diffDays)} hari. Hubungi Juru Kunci untuk pelepasan.`
                        : statusInfo.isHariIni
                        ? 'Kontrak gaib berakhir hari ini.'
                        : `Kontrak gaib berakhir ${statusInfo.statusText}.`}
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
                    Kapasitas raga masih tersedia. Klik untuk memanggil khodam baru dari katalog gaib.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#d8b168] px-3.5 py-1.5 text-xs font-bold text-stone-950 group-hover:bg-[#c99f52] transition-colors">
                    <span>Panggil Khodam</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              )}
            </div>
          )}

          {/* Advisory Box (Pelepasan via Juru Kunci) */}
          <div className="mt-8 max-w-3xl rounded-xl border border-stone-800/80 bg-[#12100e] p-5 shadow-lg flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-stone-400">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Ingin melepas khodam?
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Hubungi Juru Kunci. Pelepasan dan perhitungan mahar diproses oleh Juru Kunci, bukan dari akun Pengamal.
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
    </div>
  );
}
