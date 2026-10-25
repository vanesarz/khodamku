'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { Printer, ChevronDown, RefreshCw } from 'lucide-react';
import { getAnchoredTransactions } from '@/lib/dateUtils';

export interface CatatanGaibRecord {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  khodam: {
    nama: string;
    kode_khodam: string;
  };
  tgl_panggil: string;
  raw_tgl_panggil?: string;
  tgl_jatuh_tempo: string;
  tgl_pelepasan: string;
  mahar: number;
  mahar_formatted: string;
  status: 'Aktif' | 'Terlambat' | 'Dilepas';
}

const getInitialRecords = (): CatatanGaibRecord[] => {
  return getAnchoredTransactions().map((item) => ({
    id: item.id,
    kode_transaksi: item.kode_transaksi,
    pengamal: item.pengamal,
    khodam: {
      nama: item.khodam.nama,
      kode_khodam: item.khodam.kode_khodam,
    },
    tgl_panggil: item.tgl_panggil,
    raw_tgl_panggil: item.tgl_panggil_raw,
    tgl_jatuh_tempo: item.tgl_jatuh_tempo,
    tgl_pelepasan: item.tgl_pelepasan,
    mahar: item.mahar,
    mahar_formatted: item.mahar_formatted,
    status: item.status,
  }));
};

export default function AdminBukuCatatanGaibPage() {
  const [records, setRecords] = useState<CatatanGaibRecord[]>([]);
  const [selectedPengamal, setSelectedPengamal] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dariTanggal, setDariTanggal] = useState<string>('');
  const [sampaiTanggal, setSampaiTanggal] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch live from proxy API
  useEffect(() => {
    setRecords(getInitialRecords());
    const loadData = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch('/api/admin/buku-catatan-gaib');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            setRecords(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch remote buku catatan gaib data:', err);
      } finally {
        setIsRefreshing(false);
      }
    };

    loadData();
  }, []);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // Pengamal filter
      if (selectedPengamal !== 'all' && item.pengamal !== selectedPengamal) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus.toLowerCase() !== item.status.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (dariTanggal && item.raw_tgl_panggil) {
        if (item.raw_tgl_panggil < dariTanggal) {
          return false;
        }
      }
      if (sampaiTanggal && item.raw_tgl_panggil) {
        if (item.raw_tgl_panggil > sampaiTanggal) {
          return false;
        }
      }

      return true;
    });
  }, [records, selectedPengamal, selectedStatus, dariTanggal, sampaiTanggal]);

  // Total Mahar Calculation
  const totalMahar = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => acc + curr.mahar, 0);
  }, [filteredRecords]);

  // Distinct Pengamals for dropdown
  const pengamalOptions = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.pengamal) set.add(r.pengamal);
    });
    return Array.from(set).sort();
  }, [records]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Role-aware Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0 print:pl-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4 flex items-center justify-between print:hidden">
          <HeaderDate />
          {isRefreshing && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <RefreshCw className="h-3 w-3 animate-spin text-[#d8b168]" />
              <span>Menyelaraskan catatan gaib...</span>
            </div>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full print:p-4">
          {/* Section Heading & Print Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
                Riwayat Seluruh Anggota
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Buku Catatan Gaib
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                Setiap pemanggilan dan pelepasan tercatat permanen. Saring lalu cetak sebagai laporan.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-stone-800 bg-[#171513] hover:bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:text-white transition-colors shadow-sm self-start sm:self-auto shrink-0 print:hidden active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak laporan</span>
            </button>
          </div>

          {/* 4-Input Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 print:hidden">
            {/* Filter 1: Pengamal */}
            <div>
              <label
                htmlFor="filter-pengamal"
                className="block text-xs text-stone-400 mb-1.5 font-medium"
              >
                Pengamal
              </label>
              <div className="relative">
                <select
                  id="filter-pengamal"
                  value={selectedPengamal}
                  onChange={(e) => setSelectedPengamal(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-stone-800 bg-[#12100e] px-3.5 py-2.5 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none transition-colors"
                >
                  <option value="all">Semua Pengamal</option>
                  {pengamalOptions.map((pengamal) => (
                    <option key={pengamal} value={pengamal}>
                      {pengamal}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-stone-500" />
              </div>
            </div>

            {/* Filter 2: Status */}
            <div>
              <label
                htmlFor="filter-status"
                className="block text-xs text-stone-400 mb-1.5 font-medium"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="filter-status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-stone-800 bg-[#12100e] px-3.5 py-2.5 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none transition-colors"
                >
                  <option value="all">Semua status</option>
                  <option value="aktif">Aktif</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="dilepas">Dilepas</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-stone-500" />
              </div>
            </div>

            {/* Filter 3: Dari Tanggal */}
            <div>
              <label
                htmlFor="filter-dari-tanggal"
                className="block text-xs text-stone-400 mb-1.5 font-medium"
              >
                Dari tanggal
              </label>
              <input
                id="filter-dari-tanggal"
                type="date"
                value={dariTanggal}
                onChange={(e) => setDariTanggal(e.target.value)}
                className="w-full rounded-lg border border-stone-800 bg-[#12100e] px-3.5 py-2.5 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            {/* Filter 4: Sampai Tanggal */}
            <div>
              <label
                htmlFor="filter-sampai-tanggal"
                className="block text-xs text-stone-400 mb-1.5 font-medium"
              >
                Sampai tanggal
              </label>
              <input
                id="filter-sampai-tanggal"
                type="date"
                value={sampaiTanggal}
                onChange={(e) => setSampaiTanggal(e.target.value)}
                className="w-full rounded-lg border border-stone-800 bg-[#12100e] px-3.5 py-2.5 text-xs text-stone-200 focus:border-amber-500/50 focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Ledger Table Container */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-stone-800/80 text-[10px] font-mono tracking-wider text-stone-500 uppercase">
                    <th scope="col" className="py-4 pl-6 pr-4 font-medium">
                      ID
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Pengamal
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Khodam
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Dipanggil
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Jatuh Tempo
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Dilepas
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium">
                      Mahar
                    </th>
                    <th scope="col" className="py-4 pl-4 pr-6 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-800/60 text-xs">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-stone-500">
                        Tidak ada riwayat catatan gaib yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-stone-900/30"
                      >
                        {/* ID Column */}
                        <td className="py-4 pl-6 pr-4 font-mono text-stone-400">
                          {item.kode_transaksi}
                        </td>

                        {/* Pengamal Column */}
                        <td className="py-4 px-4 text-stone-300">
                          {item.pengamal}
                        </td>

                        {/* Khodam Column */}
                        <td className="py-4 px-4">
                          <div>
                            <span className="font-bold text-white block">
                              {item.khodam.nama}
                            </span>
                            <span className="text-[10px] font-mono text-stone-500 block mt-0.5">
                              {item.khodam.kode_khodam}
                            </span>
                          </div>
                        </td>

                        {/* Dipanggil Column */}
                        <td className="py-4 px-4 text-stone-400">
                          {item.tgl_panggil}
                        </td>

                        {/* Jatuh Tempo Column */}
                        <td className="py-4 px-4 text-stone-400">
                          {item.tgl_jatuh_tempo}
                        </td>

                        {/* Dilepas Column */}
                        <td className="py-4 px-4 text-stone-500">
                          {item.tgl_pelepasan}
                        </td>

                        {/* Mahar Column */}
                        <td className="py-4 px-4">
                          <span
                            className={
                              item.status === 'Terlambat'
                                ? 'text-stone-300 font-semibold'
                                : 'text-stone-400'
                            }
                          >
                            {item.mahar_formatted}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 pl-4 pr-6">
                          {item.status === 'Terlambat' ? (
                            <span className="inline-flex rounded-full border border-amber-900/60 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-medium text-amber-500">
                              Terlambat
                            </span>
                          ) : item.status === 'Aktif' ? (
                            <span className="inline-flex rounded-full border border-stone-800 bg-stone-900/60 px-2.5 py-0.5 text-[10px] font-medium text-stone-300">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-stone-800/80 bg-stone-900/40 px-2.5 py-0.5 text-[10px] font-medium text-stone-500">
                              Dilepas
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Footer / Summary Row */}
                <tfoot>
                  <tr className="border-t border-stone-800/80 bg-[#100e0c]/60 text-xs">
                    <td colSpan={6} className="py-4 pl-6 pr-4 text-stone-400 font-medium">
                      {filteredRecords.length} transaksi
                    </td>
                    <td colSpan={2} className="py-4 pl-4 pr-6 text-right font-extrabold text-white text-sm">
                      Rp{totalMahar.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
