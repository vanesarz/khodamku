'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import KhodamDetailModal from '@/components/landing/KhodamDetailModal';
import { useAuth } from '@/hooks/useAuth';
import { Khodam } from '@/types';
import { getAnchoredTransactions, calculateDueDateStatus, formatDateFull } from '@/lib/dateUtils';

// The 3 khodams for "Siap Dipanggil" matching the screenshot
const READY_KHODAMS: Khodam[] = [
  {
    id: 2,
    kode_khodam: 'KHD-MCP-002',
    nama: 'Macan Putih',
    asal: 'Gunung Lawu, Karanganyar',
    level_kekuatan: 5,
    deskripsi: 'Siluman macan putih bertuah penunggu kabut mistis puncak Lawu.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 1, nama: 'Penjaga Rumah' },
      { id: 4, nama: 'Kewibawaan' },
    ],
  },
  {
    id: 3,
    kode_khodam: 'KHD-HRM-001',
    nama: 'Harimau Sumatra',
    asal: 'Bukit Barisan, Sumatra Barat',
    level_kekuatan: 4,
    deskripsi: 'Aura rimba Sumatra yang kuat untuk proteksi dan wibawa tingkat tinggi.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 4, nama: 'Kewibawaan' },
      { id: 5, nama: 'Penolak Bala' },
    ],
  },
  {
    id: 7,
    kode_khodam: 'KHD-KDP-001',
    nama: 'Kulkas Dua Pintu',
    asal: 'Pasar Elektronik Glodok',
    level_kekuatan: 2,
    deskripsi: 'Khodam pendingin emosi dan penglaris perniagaan kuliner.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 2, nama: 'Penglaris Dagangan' }],
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedKhodam, setSelectedKhodam] = useState<Khodam | null>(null);
  const [invocations, setInvocations] = useState<any[]>([]);
  const [anchoredList, setAnchoredList] = useState<any[]>([]);
  const [activeKhodamIndex, setActiveKhodamIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Dynamic user name greeting
  const fullName = user?.name || 'Pengamal';
  const firstName = fullName.split(' ')[0] || 'Pengamal';

  // Load account-specific data
  useEffect(() => {
    setAnchoredList(getAnchoredTransactions());
    const loadPemanggilan = async () => {
      try {
        const res = await fetch('/api/pemanggilan');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setInvocations(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch account invocations:', err);
      } finally {
        setHasLoaded(true);
      }
    };
    loadPemanggilan();
  }, [user]);

  // Active contracts for this account anchored to real Today
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

    return invocations.filter((item) => {
      const s = String(item.status || '').toLowerCase();
      return s === 'aktif' || s === 'terlambat';
    });
  }, [invocations, user, anchoredList, hasLoaded]);

  const activeContract = activeContracts[activeKhodamIndex] || activeContracts[0];

  // Calculate real due date status
  const dueStatus = useMemo(() => {
    if (!activeContract?.tgl_jatuh_tempo_raw && !activeContract?.tgl_jatuh_tempo) {
      return { statusText: '—', isTerlambat: false, isHariIni: false, maharFormatted: 'Rp0', diffDays: 0 };
    }
    const raw = activeContract.tgl_jatuh_tempo_raw || activeContract.tgl_jatuh_tempo;
    return calculateDueDateStatus(raw);
  }, [activeContract]);

  const progressWidth = useMemo(() => {
    if (!activeContract) return '0%';
    if (dueStatus.isTerlambat) return '100%';
    if (dueStatus.isHariIni) return '90%';
    const remaining = Math.abs(dueStatus.diffDays);
    return `${Math.max(20, 100 - remaining * 20)}%`;
  }, [dueStatus, activeContract]);

  // Summary Metrics based on account
  const totalCount = useMemo(() => {
    if (invocations.length > 0) return invocations.length;
    const emailLower = user?.email?.toLowerCase() || '';
    if (emailLower.includes('sekar')) return 2;
    if (emailLower.includes('bima')) return 3;
    if (emailLower.includes('raka') || emailLower.includes('pengamal@demo.test')) return 3;
    return 0;
  }, [invocations, user]);

  const totalMaharPaid = useMemo(() => {
    if (invocations.length > 0) {
      return invocations
        .filter((i) => String(i.status || '').toLowerCase() === 'dilepas')
        .reduce((sum, curr) => sum + (Number(curr.mahar) || 0), 0);
    }
    const emailLower = user?.email?.toLowerCase() || '';
    if (emailLower.includes('sekar')) return 10000;
    if (emailLower.includes('bima')) return 0;
    if (emailLower.includes('raka') || emailLower.includes('pengamal@demo.test')) return 10000;
    return 0;
  }, [invocations, user]);

  const sigil = activeContract?.khodam?.kode_khodam?.split('-')[1] || activeContract?.khodam?.sigil || 'KHD';

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
          {/* Welcome Header */}
          <div className="mb-10">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Dashboard Pribadi
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Sugeng rawuh, {firstName}.
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Pantau kontrak gaib yang sedang berjalan dan kapan harus menghubungi Juru Kunci.
            </p>
          </div>

          {/* Middle Widgets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* Left Widget: Kontrak Aktif */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">
                      Kontrak aktif
                    </h2>
                    {activeContracts.length > 1 && (
                      <div className="flex items-center gap-1.5 ml-2">
                        {activeContracts.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveKhodamIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              activeKhodamIndex === idx
                                ? 'w-5 bg-[#d8b168]'
                                : 'w-2 bg-stone-700 hover:bg-stone-500'
                            }`}
                            aria-label={`Khodam aktif ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/pemanggilan"
                    className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    <span>Semua pemanggilan</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {activeContract ? (
                  <>
                    {/* Khodam Identity Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-xs font-bold text-stone-200">
                          {sigil}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {activeContract.khodam?.nama}
                          </h3>
                          <p className="text-[10px] font-mono text-stone-500 uppercase">
                            {activeContract.khodam?.kode_khodam}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-semibold ${
                          dueStatus.isTerlambat
                            ? 'text-amber-500'
                            : dueStatus.isHariIni
                            ? 'text-amber-400'
                            : 'text-stone-400'
                        }`}
                      >
                        {dueStatus.statusText}
                      </span>
                    </div>

                    {/* Timeline Progress Bar */}
                    <div className="mt-5 mb-6">
                      <div className="h-1 w-full bg-stone-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            dueStatus.isTerlambat ? 'bg-amber-500' : 'bg-white'
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
                          {formatDateFull(activeContract.tgl_panggil_raw || activeContract.tgl_panggil)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-stone-500">
                          Jatuh tempo
                        </p>
                        <p className="text-xs font-semibold text-white mt-1">
                          {formatDateFull(activeContract.tgl_jatuh_tempo_raw || activeContract.tgl_jatuh_tempo)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-stone-500">
                          Estimasi mahar
                        </p>
                        <p className="text-xs font-semibold text-white mt-1">
                          {dueStatus.maharFormatted}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="h-10 w-10 rounded-full border border-stone-800 bg-stone-900/60 flex items-center justify-center text-stone-500 mb-2">
                      <Sparkles className="h-4 w-4 text-[#d8b168]" />
                    </div>
                    <p className="text-sm font-semibold text-white">Tidak ada khodam bersemayam</p>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm">
                      Semua khodam telah dilepaskan. Kamu memiliki 2 slot raga yang siap menerima khodam baru.
                    </p>
                    <Link
                      href="/katalog"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#d8b168] px-3.5 py-1.5 text-xs font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors"
                    >
                      <span>Pilih di katalog</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Bottom footer row */}
              <div className="mt-8 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs">
                <span className="text-stone-400">
                  {activeContract
                    ? dueStatus.isTerlambat
                      ? `Melewati tempo ${Math.abs(dueStatus.diffDays)} hari. Harap hubungi Juru Kunci.`
                      : dueStatus.isHariIni
                      ? 'Kontrak berakhir hari ini.'
                      : `Kontrak gaib berakhir ${dueStatus.statusText}.`
                    : 'Ragamu sedang suci dan tenang tanpa ikatan gaib.'}
                </span>
                {activeContract && (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedKhodam({
                        id: activeContract.khodam?.id || 1,
                        nama: activeContract.khodam?.nama || '',
                        kode_khodam: activeContract.khodam?.kode_khodam || '',
                        asal: activeContract.khodam?.asal || 'Tanah Jawa',
                        level_kekuatan: activeContract.khodam?.level_kekuatan || 4,
                        deskripsi:
                          activeContract.khodam?.deskripsi ||
                          'Entitas gaib pelindung yang setia menjaga raga pengamal.',
                        foto: null,
                        status: 'Sedang Bersemayam',
                        is_tersedia: false,
                        kategoris: [],
                      })
                    }
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-amber-300 transition-colors"
                  >
                    <span>Lihat khodam</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Kapasitas Raga & Summary Stats */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Kapasitas Raga Card */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl">
                <p className="text-[10px] font-semibold tracking-wider text-[#d8b168] uppercase">
                  Kapasitas Raga
                </p>

                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    {activeContracts.length}
                  </span>
                  <span className="text-2xl font-bold text-stone-600">
                    /2
                  </span>
                </div>

                {/* Progress bar */}
                <div className="my-3.5 h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      activeContracts.length >= 2
                        ? 'bg-amber-400'
                        : activeContracts.length === 1
                        ? 'bg-white'
                        : 'bg-stone-700'
                    }`}
                    style={{
                      width:
                        activeContracts.length >= 2
                          ? '100%'
                          : activeContracts.length === 1
                          ? '50%'
                          : '0%',
                    }}
                  />
                </div>

                <p className="text-xs text-stone-400">
                  {activeContracts.length >= 2
                    ? 'Kapasitas penuh (maksimal 2 khodam per raga).'
                    : activeContracts.length === 1
                    ? 'Tersedia 1 slot kosong untuk memanggil satu khodam lagi.'
                    : 'Tersedia 2 slot kosong. Kamu bisa memanggil khodam pendamping baru.'}
                </p>
              </div>

              {/* Two-Column Stats Box */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl">
                <div className="grid grid-cols-2 divide-x divide-stone-800">
                  <div className="pr-4">
                    <p className="text-xs text-stone-500">
                      Total pemanggilan
                    </p>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      {totalCount}
                    </p>
                  </div>
                  <div className="pl-6">
                    <p className="text-xs text-stone-500">
                      Mahar dibayar
                    </p>
                    <p className="text-2xl font-extrabold text-white mt-1">
                      Rp{totalMaharPaid.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Siap Dipanggil */}
          <section className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                Siap dipanggil
              </h2>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
              >
                <span>Lihat katalog</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* 3 Khodam Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {READY_KHODAMS.map((khodam) => {
                const itemSigil = khodam.kode_khodam.split('-')[1] || 'KHD';
                const subnum = khodam.kode_khodam.split('-')[2] || '001';

                return (
                  <div
                    key={khodam.id}
                    onClick={() => setSelectedKhodam(khodam)}
                    className="group cursor-pointer rounded-xl border border-stone-800/80 bg-[#12100e] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-stone-700 hover:shadow-2xl"
                  >
                    {/* Top Code */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 uppercase">
                      <span>{khodam.kode_khodam}</span>
                    </div>

                    {/* Circular Radar / Target Sigil */}
                    <div className="flex items-center justify-center py-7">
                      <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border border-stone-800 bg-stone-900/50 shadow-inner group-hover:border-amber-500/40 transition-colors">
                        <div className="absolute inset-1.5 rounded-full border border-stone-800/80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-full w-[1px] bg-stone-800/40" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-stone-800/40" />
                        </div>

                        <span className="font-mono text-sm font-bold tracking-widest text-stone-200 group-hover:text-amber-300 transition-colors z-10">
                          {itemSigil}
                        </span>
                        <span className="font-mono text-[9px] text-stone-500 z-10 mt-0.5">
                          {subnum}
                        </span>
                      </div>
                    </div>

                    {/* Identity & Signal */}
                    <div className="pt-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                          {khodam.nama}
                        </h3>

                        <div className="flex items-end gap-[2px] h-3.5 pt-0.5">
                          {[1, 2, 3, 4, 5].map((lvl) => {
                            const heights = ['h-1', 'h-1.5', 'h-2', 'h-2.5', 'h-3'];
                            const isActive = lvl <= khodam.level_kekuatan;
                            return (
                              <span
                                key={lvl}
                                className={`w-[3px] rounded-xs ${heights[lvl - 1]} ${
                                  isActive
                                    ? 'bg-amber-400 group-hover:bg-amber-300'
                                    : 'bg-stone-800'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <p className="mt-1 text-xs text-stone-400">
                        {khodam.asal}
                      </p>
                      <p className="mt-0.5 text-[11px] text-stone-500 truncate">
                        {khodam.kategoris.map((k) => k.nama).join(' · ')}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/60 px-2 py-0.5 text-[11px] font-medium text-stone-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>{khodam.status}</span>
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-stone-400 group-hover:text-amber-300 transition-colors">
                        <span>Detail</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
