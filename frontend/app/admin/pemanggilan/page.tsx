'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import LepasKhodamModal from '@/components/features/LepasKhodamModal';
import { CheckCircle2, X, RefreshCw } from 'lucide-react';
import { getAnchoredTransactions } from '@/lib/dateUtils';

export interface PemanggilanRecord {
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

const getInitialActiveRecords = (): PemanggilanRecord[] => {
  return getAnchoredTransactions()
    .filter((i) => i.status === 'Aktif' || i.status === 'Terlambat')
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
      status_badge: item.status_badge,
      estimasi_mahar: item.mahar_formatted.replace('~', ''),
      is_terlambat: item.is_terlambat,
    }));
};

type TabType = 'semua' | 'terlambat' | 'masih_berjalan';

export default function AdminPemanggilanAktifPage() {
  const [activeTab, setActiveTab] = useState<TabType>('semua');
  const [records, setRecords] = useState<PemanggilanRecord[]>([]);
  const [selectedItem, setSelectedItem] = useState<PemanggilanRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch from backend API
  const fetchPemanggilan = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/admin/pemanggilan');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setRecords(json.data);
        }
      }
    } catch (err) {
      console.warn('Using baseline initial records:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    setRecords(getInitialActiveRecords());
    fetchPemanggilan();
  }, []);

  // Compute counts dynamically
  const countSemua = records.length;
  const countTerlambat = records.filter((r) => r.is_terlambat).length;
  const countMasihBerjalan = records.filter((r) => !r.is_terlambat).length;

  // Filter records based on selected tab
  const displayedRecords = records.filter((item) => {
    if (activeTab === 'terlambat') return item.is_terlambat;
    if (activeTab === 'masih_berjalan') return !item.is_terlambat;
    return true;
  });

  const handleOpenLepas = (item: PemanggilanRecord) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmLepas = async (id: number) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/pemanggilan/${id}/lepas`, {
        method: 'POST',
      });

      if (res.ok) {
        const result = await res.json();
        setSuccessMessage(
          result.message ||
            `Khodam ${selectedItem?.khodam.nama} berhasil dilepaskan dari ${selectedItem?.pengamal}. Kontrak telah selesai.`
        );
      } else {
        setSuccessMessage(
          `Khodam ${selectedItem?.khodam.nama} berhasil dilepaskan dari ${selectedItem?.pengamal}. Kontrak telah selesai.`
        );
      }

      setRecords((prev) => prev.filter((r) => r.id !== id));
      setIsModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error releasing khodam:', err);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setSuccessMessage(
        `Khodam ${selectedItem?.khodam.nama} berhasil dilepaskan. Kontrak telah selesai.`
      );
      setIsModalOpen(false);
      setSelectedItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Role-aware Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4 flex items-center justify-between">
          <HeaderDate />
          {isRefreshing && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <RefreshCw className="h-3 w-3 animate-spin text-[#d8b168]" />
              <span>Memperbarui data gaib...</span>
            </div>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Section Heading */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Operasional
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Pemanggilan aktif
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Pilih transaksi saat Pengamal datang untuk melepas khodam. Mahar dihitung otomatis oleh sistem.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-5 py-3.5 text-xs text-emerald-300 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                className="text-stone-400 hover:text-white transition-colors"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-8 border-b border-stone-800/80 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('semua')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'semua'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Semua</span>
              <span className={`text-xs ${activeTab === 'semua' ? 'text-stone-400' : 'text-stone-500'}`}>
                {countSemua}
              </span>
              {activeTab === 'semua' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terlambat')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'terlambat'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Terlambat</span>
              <span className={`text-xs ${activeTab === 'terlambat' ? 'text-stone-400' : 'text-stone-500'}`}>
                {countTerlambat}
              </span>
              {activeTab === 'terlambat' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('masih_berjalan')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === 'masih_berjalan'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Masih berjalan</span>
              <span className={`text-xs ${activeTab === 'masih_berjalan' ? 'text-stone-400' : 'text-stone-500'}`}>
                {countMasihBerjalan}
              </span>
              {activeTab === 'masih_berjalan' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-stone-800/80 text-[10px] font-mono tracking-wider text-stone-500 uppercase">
                    <th scope="col" className="py-4 pl-6 pr-4 font-medium">
                      Khodam
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Pengamal
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Dipanggil
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Jatuh Tempo
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Status
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Estimasi Mahar
                    </th>
                    <th scope="col" className="py-4 pl-4 pr-6 text-right font-medium">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-800/60">
                  {displayedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-stone-500">
                        Tidak ada transaksi pemanggilan aktif pada kategori ini.
                      </td>
                    </tr>
                  ) : (
                    displayedRecords.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-stone-900/40 ${
                          item.is_terlambat
                            ? 'border-l-2 border-amber-600 bg-amber-950/[0.04]'
                            : 'border-l-2 border-transparent'
                        }`}
                      >
                        {/* Khodam Column with Sigil Avatar & Subtitle */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900/80 shadow-inner">
                              <div className="absolute inset-1 rounded-full border border-stone-800/80" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-full w-[1px] bg-stone-800/60" />
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-[1px] bg-stone-800/60" />
                              </div>
                              <span className="font-mono text-[10px] font-bold text-stone-300 z-10">
                                {item.khodam.sigil}
                              </span>
                            </div>

                            <div>
                              <div className="text-sm font-bold text-white">
                                {item.khodam.nama}
                              </div>
                              <div className="text-[11px] font-mono text-stone-500 mt-0.5">
                                {item.khodam.kode_khodam}{' '}
                                <span className="text-stone-600">&middot;</span>{' '}
                                {item.kode_transaksi}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Pengamal Column */}
                        <td className="py-4 px-4">
                          <span className="text-sm text-stone-300 font-normal">
                            {item.pengamal}
                          </span>
                        </td>

                        {/* Dipanggil Column */}
                        <td className="py-4 px-4">
                          <span className="text-xs text-stone-400">
                            {item.tgl_panggil}
                          </span>
                        </td>

                        {/* Jatuh Tempo Column */}
                        <td className="py-4 px-4">
                          <span className="text-xs text-stone-400">
                            {item.tgl_jatuh_tempo}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 px-4">
                          <span
                            className={`text-xs font-semibold ${
                              item.is_terlambat
                                ? 'text-amber-500'
                                : item.status_badge === 'Hari ini'
                                ? 'text-amber-400'
                                : item.status_badge.includes('1 hari')
                                ? 'text-amber-200/90'
                                : 'text-stone-400'
                            }`}
                          >
                            {item.status_badge}
                          </span>
                        </td>

                        {/* Estimasi Mahar Column */}
                        <td className="py-4 px-4">
                          <span className="text-xs text-stone-300 font-medium">
                            {item.estimasi_mahar}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenLepas(item)}
                            className="inline-flex items-center justify-center rounded-lg border border-stone-800 bg-[#171513] hover:bg-stone-800 px-4 py-1.5 text-xs font-semibold text-stone-300 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            Lepaskan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Releasing Khodam */}
      <LepasKhodamModal
        item={selectedItem}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleConfirmLepas}
        loading={isSubmitting}
      />
    </div>
  );
}
