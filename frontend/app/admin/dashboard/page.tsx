'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { getAnchoredTransactions } from '@/lib/dateUtils';

interface AdminPemanggilanItem {
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
  tgl_jatuh_tempo_raw?: string;
  status_badge: string;
  estimasi_mahar: string;
  mahar?: number;
  is_terlambat: boolean;
}

const KATEGORI_ITEMS = [
  { nama: 'Penjaga Rumah', jumlah: 3, percentage: '50%' },
  { nama: 'Penglaris Dagangan', jumlah: 2, percentage: '33%' },
  { nama: 'Pelindung Ujian', jumlah: 1, percentage: '17%' },
  { nama: 'Kewibawaan', jumlah: 3, percentage: '50%' },
  { nama: 'Penolak Bala', jumlah: 2, percentage: '33%' },
  { nama: 'Pencari Jodoh', jumlah: 1, percentage: '17%' },
];

export default function AdminDashboardPage() {
  const [activeRecords, setActiveRecords] = useState<AdminPemanggilanItem[]>([]);
  const [maharTerkumpul, setMaharTerkumpul] = useState<number>(20000);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Initial baseline
    const initialBaseline = getAnchoredTransactions()
      .filter((t) => t.status === 'Aktif' || t.status === 'Terlambat')
      .map((item) => ({
        id: item.id,
        kode_transaksi: item.kode_transaksi,
        pengamal: item.pengamal,
        khodam: {
          nama: item.khodam.nama,
          kode_khodam: item.khodam.kode_khodam,
          sigil: item.khodam.sigil,
        },
        tgl_panggil: item.tgl_panggil,
        tgl_jatuh_tempo: item.tgl_jatuh_tempo,
        tgl_jatuh_tempo_raw: item.tgl_jatuh_tempo_raw,
        status_badge: item.status_badge,
        estimasi_mahar: item.mahar_formatted.replace('~', ''),
        mahar: item.mahar,
        is_terlambat: item.is_terlambat,
      }));

    setActiveRecords(initialBaseline);

    const loadDashboardData = async () => {
      try {
        const [resPemanggilan, resLedger] = await Promise.all([
          fetch('/api/admin/pemanggilan'),
          fetch('/api/admin/buku-catatan-gaib'),
        ]);

        if (resPemanggilan.ok) {
          const json = await resPemanggilan.json();
          if (json.data && Array.isArray(json.data)) {
            setActiveRecords(json.data);
          }
        }

        if (resLedger.ok) {
          const ledgerJson = await resLedger.json();
          if (ledgerJson.ringkasan && typeof ledgerJson.ringkasan.total_mahar === 'number') {
            setMaharTerkumpul(ledgerJson.ringkasan.total_mahar);
          }
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setHasLoaded(true);
      }
    };

    loadDashboardData();
  }, []);

  // Dynamic calculations
  const totalUnit = 8;
  const pemanggilanAktif = activeRecords.length;
  const sedangBersemayam = pemanggilanAktif;
  const menungguDipanggil = Math.max(0, totalUnit - sedangBersemayam);

  const terlambatRecords = useMemo(
    () => activeRecords.filter((r) => r.is_terlambat),
    [activeRecords]
  );
  const terlambatCount = terlambatRecords.length;

  const totalDenda = useMemo(() => {
    return terlambatRecords.reduce((sum, item) => {
      const val = typeof item.mahar === 'number'
        ? item.mahar
        : parseInt(String(item.estimasi_mahar || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return sum + val;
    }, 0);
  }, [terlambatRecords]);

  // Subtitle headline
  const summaryHeadline = useMemo(() => {
    if (terlambatCount > 0) {
      return `${terlambatCount} kontrak melewati jatuh tempo dengan estimasi mahar Rp${totalDenda.toLocaleString('id-ID')}.`;
    }
    if (pemanggilanAktif > 0) {
      return `Semua ${pemanggilanAktif} kontrak gaib aktif berstatus aman dan belum melewati jatuh tempo.`;
    }
    return 'Tidak ada kontrak gaib aktif saat ini. Semua khodam beristirahat di padepokan.';
  }, [terlambatCount, totalDenda, pemanggilanAktif]);

  // Filter & sort active units sorted by due date (overdue first)
  const jatuhTempoItems = useMemo(() => {
    return [...activeRecords].sort((a, b) => {
      if (a.is_terlambat && !b.is_terlambat) return -1;
      if (!a.is_terlambat && b.is_terlambat) return 1;
      const rawA = a.tgl_jatuh_tempo_raw || a.tgl_jatuh_tempo || '';
      const rawB = b.tgl_jatuh_tempo_raw || b.tgl_jatuh_tempo || '';
      return rawA.localeCompare(rawB);
    });
  }, [activeRecords]);

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Role-aware Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4">
          <HeaderDate />
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading & CTA Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
                Dashboard Juru Kunci
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Ringkasan hari ini
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                {summaryHeadline}
              </p>
            </div>

            <Link
              href="/admin/pemanggilan"
              className="inline-flex items-center justify-center rounded-lg bg-[#d8b168] px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-md active:scale-[0.99] self-start sm:self-auto shrink-0"
            >
              Proses pelepasan
            </Link>
          </div>

          {/* 5-Metric Counter Bar */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] shadow-xl mb-8">
            <div className="grid grid-cols-2 divide-y divide-stone-800 sm:grid-cols-5 sm:divide-y-0 sm:divide-x">
              {/* Metric 1 */}
              <div className="p-5 sm:p-6">
                <p className="text-xs text-stone-500 font-medium">
                  Jumlah unit
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">
                  {totalUnit}
                </p>
              </div>

              {/* Metric 2 */}
              <div className="p-5 sm:p-6">
                <p className="text-xs text-stone-500 font-medium">
                  Menunggu dipanggil
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">
                  {menungguDipanggil}
                </p>
              </div>

              {/* Metric 3 */}
              <div className="p-5 sm:p-6">
                <p className="text-xs text-stone-500 font-medium">
                  Sedang bersemayam
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">
                  {sedangBersemayam}
                </p>
              </div>

              {/* Metric 4 */}
              <div className="p-5 sm:p-6">
                <p className="text-xs text-stone-500 font-medium">
                  Pemanggilan aktif
                </p>
                <p className="mt-1 text-3xl font-extrabold text-white">
                  {pemanggilanAktif}
                </p>
              </div>

              {/* Metric 5 */}
              <div className="p-5 sm:p-6 col-span-2 sm:col-span-1">
                <p className="text-xs text-stone-500 font-medium">
                  Terlambat
                </p>
                <p
                  className={`mt-1 text-3xl font-extrabold ${
                    terlambatCount > 0 ? 'text-amber-500' : 'text-stone-300'
                  }`}
                >
                  {terlambatCount}
                </p>
              </div>
            </div>
          </div>

          {/* Lower Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Box: Jatuh Tempo Terdekat (~65% width) */}
            <div className="lg:col-span-7 rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-white">
                  Jatuh tempo terdekat
                </h2>
                <Link
                  href="/admin/pemanggilan"
                  className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <span>Semua pemanggilan</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-800/80">
                {jatuhTempoItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-stone-500">
                    Tidak ada kontrak pemanggilan yang sedang berjalan saat ini.
                  </div>
                ) : (
                  jatuhTempoItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Circular Sigil with radar crosshair target */}
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 shadow-inner">
                        <div className="absolute inset-1 rounded-full border border-stone-800/80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-full w-[1px] bg-stone-800/50" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-stone-800/50" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-stone-200 z-10">
                          {item.khodam.sigil}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {item.khodam.nama}
                        </h3>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                          {item.pengamal} &middot;{' '}
                          <span className="font-mono text-stone-500">
                            {item.khodam.kode_khodam}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 text-right">
                      <span className="text-xs text-stone-400">
                        {item.tgl_jatuh_tempo}
                      </span>
                      <span
                        className={`text-xs font-semibold w-24 text-right ${
                          item.is_terlambat
                            ? 'text-amber-500'
                            : item.status_badge === 'Hari ini'
                            ? 'text-amber-400'
                            : 'text-stone-400'
                        }`}
                      >
                        {item.status_badge}
                      </span>
                    </div>
                  </div>
                ))
              )}
              </div>
            </div>

            {/* Right Column: Kategori & Summary Stats (~35% width) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Kategori Box */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-bold text-white">
                    Kategori
                  </h2>
                  <Link
                    href="/admin/kelola/kategori"
                    className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    Kelola
                  </Link>
                </div>

                {/* Category List with counts & progress line bars */}
                <div className="space-y-4">
                  {KATEGORI_ITEMS.map((cat, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-stone-300 font-medium">
                          {cat.nama}
                        </span>
                        <span className="text-stone-400 font-mono">
                          {cat.jumlah}
                        </span>
                      </div>
                      <div className="h-1 w-full bg-stone-800/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-400 rounded-full"
                          style={{ width: cat.percentage }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Split Summary Stats Box */}
              <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-5 shadow-xl grid grid-cols-2 divide-x divide-stone-800">
                <div className="pr-4">
                  <p className="text-xs text-stone-500">
                    Pengamal terdaftar
                  </p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    3
                  </p>
                </div>
                <div className="pl-6">
                  <p className="text-xs text-stone-500">
                    Mahar terkumpul
                  </p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {`Rp${maharTerkumpul.toLocaleString('id-ID')}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
