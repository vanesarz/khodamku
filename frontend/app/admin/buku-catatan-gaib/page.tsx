'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { Printer, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';
import { getAnchoredTransactions, formatHeaderToday, toIsoDate, formatDateFull } from '@/lib/dateUtils';

export interface CatatanGaibRecord {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  khodam: {
    nama: string;
    kode_khodam: string;
  };
  tgl_panggil: string;
  raw_tgl_panggil: string;
  tgl_jatuh_tempo: string;
  tgl_pelepasan: string;
  mahar: number;
  mahar_formatted: string;
  status: 'Aktif' | 'Terlambat' | 'Dilepas';
}

const normalizeRecord = (item: any): CatatanGaibRecord => {
  // Extract ISO YYYY-MM-DD date for accurate string-based chronological filtering
  let isoDate = '';
  if (item.raw_tgl_panggil && /^\d{4}-\d{2}-\d{2}$/.test(item.raw_tgl_panggil)) {
    isoDate = item.raw_tgl_panggil;
  } else if (item.tgl_panggil_raw && /^\d{4}-\d{2}-\d{2}$/.test(item.tgl_panggil_raw)) {
    isoDate = item.tgl_panggil_raw;
  } else if (item.tgl_panggil && /^\d{4}-\d{2}-\d{2}$/.test(item.tgl_panggil)) {
    isoDate = item.tgl_panggil;
  } else if (item.tgl_panggil) {
    isoDate = toIsoDate(item.tgl_panggil, false);
  }

  // Format display date in Indonesian full format (e.g. "24 Okt 2026" or "24 Oktober 2026")
  const displayTglPanggil =
    item.tgl_panggil_formatted ||
    (isoDate ? formatDateFull(isoDate, false) : item.tgl_panggil);

  const displayJatuhTempo =
    item.tgl_jatuh_tempo_formatted ||
    (item.tgl_jatuh_tempo && /^\d{4}-\d{2}-\d{2}$/.test(item.tgl_jatuh_tempo)
      ? formatDateFull(item.tgl_jatuh_tempo, false)
      : item.tgl_jatuh_tempo);

  const displayPelepasan =
    item.tgl_pelepasan_formatted && item.tgl_pelepasan_formatted !== '—'
      ? item.tgl_pelepasan_formatted
      : item.tgl_pelepasan && /^\d{4}-\d{2}-\d{2}$/.test(item.tgl_pelepasan)
        ? formatDateFull(item.tgl_pelepasan, false)
        : (item.tgl_pelepasan || '—');

  const maharNum = Number(item.mahar) || 0;
  const statusStr = String(item.status || 'Aktif');
  const normalizedStatus: 'Aktif' | 'Terlambat' | 'Dilepas' =
    statusStr.toLowerCase() === 'dilepas'
      ? 'Dilepas'
      : statusStr.toLowerCase() === 'terlambat'
        ? 'Terlambat'
        : 'Aktif';

  return {
    id: item.id,
    kode_transaksi: item.kode_transaksi || `PMG-${item.id}`,
    pengamal: item.pengamal || 'Pengamal',
    khodam: {
      nama: item.khodam?.nama || 'Khodam Pendamping',
      kode_khodam: item.khodam?.kode_khodam || 'KHD-001',
    },
    tgl_panggil: displayTglPanggil,
    raw_tgl_panggil: isoDate,
    tgl_jatuh_tempo: displayJatuhTempo,
    tgl_pelepasan: displayPelepasan,
    mahar: maharNum,
    mahar_formatted:
      item.mahar_formatted ||
      (maharNum > 0
        ? normalizedStatus === 'Dilepas'
          ? `Rp${maharNum.toLocaleString('id-ID')}`
          : `~Rp${maharNum.toLocaleString('id-ID')}`
        : normalizedStatus === 'Dilepas'
          ? 'Rp0'
          : '~Rp0'),
    status: normalizedStatus,
  };
};

const getInitialRecords = (): CatatanGaibRecord[] => {
  return getAnchoredTransactions().map(normalizeRecord);
};

export default function AdminBukuCatatanGaibPage() {
  const [records, setRecords] = useState<CatatanGaibRecord[]>([]);
  const [selectedPengamal, setSelectedPengamal] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dariTanggal, setDariTanggal] = useState<string>('');
  const [sampaiTanggal, setSampaiTanggal] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [printDate, setPrintDate] = useState<string>('');
  const [printYear, setPrintYear] = useState<number>(2026);

  useEffect(() => {
    setPrintDate(formatHeaderToday());
    setPrintYear(new Date().getFullYear());
  }, []);

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
            setRecords(json.data.map(normalizeRecord));
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

  // Filtered dataset: supports all filters simultaneously for both Table view and Print view
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      // 1. Pengamal filter
      if (selectedPengamal !== 'all' && item.pengamal !== selectedPengamal) {
        return false;
      }

      // 2. Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus.toLowerCase() !== item.status.toLowerCase()) {
          return false;
        }
      }

      // 3. Date range filter
      // Uses raw_tgl_panggil (ISO format YYYY-MM-DD) for exact chronological comparison
      const recordDate =
        item.raw_tgl_panggil ||
        toIsoDate(item.tgl_panggil, false);

      if (dariTanggal && recordDate) {
        if (recordDate < dariTanggal) {
          return false;
        }
      }
      if (sampaiTanggal && recordDate) {
        if (recordDate > sampaiTanggal) {
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

  const handleResetFilters = () => {
    setSelectedPengamal('all');
    setSelectedStatus('all');
    setDariTanggal('');
    setSampaiTanggal('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex print:min-h-0 print:bg-white print:text-stone-900 print:block">
      {/* Role-aware Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0 print:pl-0 print:w-full print:block">
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
        <main className="flex-1 p-8 max-w-6xl w-full print:p-0 print:max-w-none print:w-full">
          {/* PRINT-ONLY: Kop Surat Resmi Padepokan KhodamKu */}
          <div className="hidden print:block mb-6">
            <div className="flex items-center justify-between pb-3 border-b-2 border-stone-900">
              <div className="flex items-center gap-3.5">
                <Image
                  src="/images/logo.png"
                  alt="Logo KhodamKu"
                  width={52}
                  height={52}
                  className="w-13 h-13 rounded-full object-contain shrink-0"
                  priority
                />
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-stone-900 leading-tight">
                    Padepokan Besar KhodamKu Nusantara
                  </h2>
                  <p className="text-[11px] text-stone-600 font-medium leading-tight mt-0.5">
                    Balai Registrasi Gaib, Konsultasi Spiritual & Peminjaman Energi Khodam
                  </p>
                  <p className="text-[9px] text-stone-500 mt-0.5">
                    Jl. Parangkusumo No. 77, Yogyakarta 55281 • Telp: (0274) 555-KHODAM • Situs: khodamku.test
                  </p>
                </div>
              </div>
              <div className="text-right border-l pl-4 border-stone-300">
                <p className="text-[9px] font-mono uppercase text-stone-500 tracking-wider">
                  Format Dokumen Resmi
                </p>
                <p className="text-xs font-bold font-mono text-stone-900">
                  DOK-BKG/{printYear}/RESMI
                </p>
                <p className="text-[9px] text-stone-500">
                  Status: Terverifikasi Sistem
                </p>
              </div>
            </div>
            {/* Garis ganda kop surat */}
            <div className="h-[1px] bg-stone-400 mt-[2px] mb-4" />

            {/* Judul Dokumen */}
            <div className="text-center mb-4">
              <h1 className="text-lg font-extrabold uppercase tracking-tight text-stone-900">
                Laporan Buku Catatan Gaib
              </h1>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Rekapitulasi Riwayat Pemanggilan, Pelepasan, & Mahar Operasional Transaksi Anggota
              </p>
            </div>

            {/* Parameter & Ringkasan Laporan */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded border border-stone-300 bg-stone-50 text-[11px] mb-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-stone-500">Tanggal Dokumen</span>
                  <span className="text-stone-900 font-semibold">: {printDate || '27 Oktober 2026'}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500">Dicetak Oleh</span>
                  <span className="text-stone-900 font-semibold">: Mbah Darmo (Juru Kunci Padepokan)</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500">Filter Status</span>
                  <span className="text-stone-900 font-semibold">
                    : {selectedStatus === 'all' ? 'Semua Status (Aktif, Terlambat, Dilepas)' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex">
                  <span className="w-28 text-stone-500">Filter Pengamal</span>
                  <span className="text-stone-900 font-semibold">
                    : {selectedPengamal === 'all' ? 'Seluruh Pengamal Terdaftar' : selectedPengamal}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500">Periode Waktu</span>
                  <span className="text-stone-900 font-semibold">
                    : {dariTanggal && sampaiTanggal
                        ? `${formatDateFull(dariTanggal, false)} s/d ${formatDateFull(sampaiTanggal, false)}`
                        : dariTanggal
                          ? `Mulai ${formatDateFull(dariTanggal, false)} s/d Sekarang`
                          : sampaiTanggal
                            ? `Hingga ${formatDateFull(sampaiTanggal, false)}`
                            : 'Seluruh Rentang Waktu'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-28 text-stone-500">Total Rekapitulasi</span>
                  <span className="text-stone-900 font-bold">
                    : {filteredRecords.length} Transaksi (Total Mahar Rp{totalMahar.toLocaleString('id-ID')})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Heading & Print Action Button (SCREEN ONLY) */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8 print:hidden">
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
              className="inline-flex items-center gap-2 rounded-lg border border-stone-800 bg-[#171513] hover:bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:text-white transition-colors shadow-sm self-start sm:self-auto shrink-0 print:hidden active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4 text-[#d8b168]" />
              <span>Cetak laporan</span>
            </button>
          </div>

          {/* 4-Input Filter Bar (SCREEN ONLY) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 print:hidden">
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

          {/* Active Filter Indicators & Reset Action (SCREEN ONLY) */}
          {(selectedPengamal !== 'all' || selectedStatus !== 'all' || dariTanggal || sampaiTanggal) && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300 bg-[#171513] border border-stone-800 rounded-lg px-4 py-2.5 mb-6 print:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>
                  Filter aktif: Menampilkan <strong className="text-white font-semibold">{filteredRecords.length}</strong> dari {records.length} riwayat transaksi
                </span>
                {selectedPengamal !== 'all' && (
                  <span className="inline-flex items-center rounded bg-stone-800/80 px-2 py-0.5 text-[11px] text-amber-300">
                    Pengamal: {selectedPengamal}
                  </span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="inline-flex items-center rounded bg-stone-800/80 px-2 py-0.5 text-[11px] text-amber-300">
                    Status: {selectedStatus.toUpperCase()}
                  </span>
                )}
                {(dariTanggal || sampaiTanggal) && (
                  <span className="inline-flex items-center rounded bg-stone-800/80 px-2 py-0.5 text-[11px] text-amber-300">
                    Periode: {dariTanggal ? formatDateFull(dariTanggal, false) : 'Awal'} s/d {sampaiTanggal ? formatDateFull(sampaiTanggal, false) : 'Kini'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2 transition-colors cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filter</span>
              </button>
            </div>
          )}

          {/* Ledger Table Container */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] overflow-hidden shadow-2xl print:border print:border-stone-400 print:bg-white print:rounded-none print:shadow-none print:overflow-visible">
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse min-w-[760px] print:min-w-0 print:w-full print:table-auto">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-stone-800/80 text-[10px] font-mono tracking-wider text-stone-500 uppercase print:border-b-2 print:border-stone-400 print:bg-stone-100 print:text-stone-800">
                    <th scope="col" className="py-4 pl-6 pr-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      ID
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Pengamal
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Khodam
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Dipanggil
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Jatuh Tempo
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Dilepas
                    </th>
                    <th scope="col" className="py-4 px-4 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Mahar
                    </th>
                    <th scope="col" className="py-4 pl-4 pr-6 font-medium print:py-2 print:px-2.5 print:text-[10px] print:font-bold">
                      Status
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-800/60 text-xs print:divide-y print:divide-stone-300 print:text-[10px]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-stone-500 print:text-stone-600 print:py-8">
                        <div>
                          <p className="font-semibold text-stone-300 print:text-stone-800">
                            Tidak ada riwayat catatan gaib yang sesuai filter.
                          </p>
                          <p className="text-xs text-stone-500 print:text-stone-600 mt-1">
                            Saringan aktif:{' '}
                            {selectedPengamal !== 'all' && `Pengamal "${selectedPengamal}", `}
                            {selectedStatus !== 'all' && `Status "${selectedStatus.toUpperCase()}", `}
                            {dariTanggal && `Dari ${dariTanggal}, `}
                            {sampaiTanggal && `Sampai ${sampaiTanggal}`}
                            {selectedPengamal === 'all' && selectedStatus === 'all' && !dariTanggal && !sampaiTanggal && 'Semua data kosong.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-stone-900/30 print:border-b print:border-stone-200 print:odd:bg-white print:even:bg-stone-50/70"
                      >
                        {/* ID Column */}
                        <td className="py-4 pl-6 pr-4 font-mono text-stone-400 print:py-2 print:px-2.5 print:text-stone-900 print:font-bold">
                          {item.kode_transaksi}
                        </td>

                        {/* Pengamal Column */}
                        <td className="py-4 px-4 text-stone-300 print:py-2 print:px-2.5 print:text-stone-900 print:font-medium">
                          {item.pengamal}
                        </td>

                        {/* Khodam Column */}
                        <td className="py-4 px-4 print:py-2 print:px-2.5">
                          <div>
                            <span className="font-bold text-white block print:text-stone-900 print:text-[10.5px]">
                              {item.khodam.nama}
                            </span>
                            <span className="text-[10px] font-mono text-stone-500 block mt-0.5 print:text-stone-600 print:text-[9px]">
                              {item.khodam.kode_khodam}
                            </span>
                          </div>
                        </td>

                        {/* Dipanggil Column */}
                        <td className="py-4 px-4 text-stone-400 print:py-2 print:px-2.5 print:text-stone-800">
                          {item.tgl_panggil}
                        </td>

                        {/* Jatuh Tempo Column */}
                        <td className="py-4 px-4 text-stone-400 print:py-2 print:px-2.5 print:text-stone-800">
                          {item.tgl_jatuh_tempo}
                        </td>

                        {/* Dilepas Column */}
                        <td className="py-4 px-4 text-stone-500 print:py-2 print:px-2.5 print:text-stone-600">
                          {item.tgl_pelepasan || '—'}
                        </td>

                        {/* Mahar Column */}
                        <td className="py-4 px-4 print:py-2 print:px-2.5">
                          <span
                            className={
                              item.status === 'Terlambat'
                                ? 'text-stone-300 font-semibold print:text-amber-800 print:font-bold'
                                : 'text-stone-400 print:text-stone-800'
                            }
                          >
                            {item.mahar_formatted}
                          </span>
                        </td>

                        {/* Status Column */}
                        <td className="py-4 pl-4 pr-6 print:py-2 print:px-2.5">
                          {item.status === 'Terlambat' ? (
                            <span className="inline-flex rounded-full border border-amber-900/60 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-medium text-amber-500 print:border-amber-700 print:bg-amber-50 print:text-amber-900 print:font-semibold print:px-2 print:py-0.5 print:text-[9px]">
                              Terlambat
                            </span>
                          ) : item.status === 'Aktif' ? (
                            <span className="inline-flex rounded-full border border-stone-800 bg-stone-900/60 px-2.5 py-0.5 text-[10px] font-medium text-stone-300 print:border-blue-700 print:bg-blue-50 print:text-blue-900 print:font-semibold print:px-2 print:py-0.5 print:text-[9px]">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full border border-stone-800/80 bg-stone-900/40 px-2.5 py-0.5 text-[10px] font-medium text-stone-500 print:border-stone-400 print:bg-stone-100 print:text-stone-700 print:font-medium print:px-2 print:py-0.5 print:text-[9px]">
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
                  <tr className="border-t border-stone-800/80 bg-[#100e0c]/60 text-xs print:border-t-2 print:border-stone-400 print:bg-stone-100 print:text-stone-900">
                    <td colSpan={6} className="py-4 pl-6 pr-4 text-stone-400 font-medium print:py-2.5 print:px-2.5 print:text-stone-800 print:font-bold">
                      Total Rekapitulasi: {filteredRecords.length} transaksi
                    </td>
                    <td colSpan={2} className="py-4 pl-4 pr-6 text-right font-extrabold text-white text-sm print:py-2.5 print:px-2.5 print:text-stone-900 print:font-black">
                      Rp{totalMahar.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* PRINT-ONLY: Bagian Pengesahan & Tanda Tangan */}
          <div className="hidden print:block mt-8 pt-4">
            <div className="flex justify-between items-start gap-8">
              <div className="max-w-xs text-[10px] text-stone-600 space-y-1.5">
                <p className="font-bold text-stone-800 uppercase tracking-wider">
                  Ketentuan Dokumen Buku Catatan Gaib:
                </p>
                <p>
                  1. Dokumen ini adalah catatan historis resmi dari Buku Catatan Gaib Padepokan KhodamKu.
                </p>
                <p>
                  2. Seluruh transaksi pemanggilan dan pelepasan yang tertera telah dicatat secara permanen (*immutable records*).
                </p>
                <p>
                  3. Denda/mahar keterlambatan terhitung otomatis sesuai regulasi harian padepokan.
                </p>
              </div>

              <div className="text-right text-[11px] text-stone-800 min-w-[220px]">
                <p className="text-stone-600">Yogyakarta, {printDate || '27 Oktober 2026'}</p>
                <p className="font-medium mt-1">Juru Kunci Padepokan,</p>
                
                {/* Signature space */}
                <div className="h-16 flex items-center justify-end pr-4">
                  <div className="w-24 h-12 border border-dashed border-amber-700/60 rounded flex items-center justify-center text-[9px] text-amber-800 font-mono rotate-[-4deg] bg-amber-50/40">
                    [ CAP RESMI GAIB ]
                  </div>
                </div>

                <p className="font-bold underline text-xs text-stone-900">
                  Mbah Darmo
                </p>
                <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                  ID Kunci: JK-001 • Juru Kunci Agung
                </p>
              </div>
            </div>

            {/* Footer Catatan Kaki */}
            <div className="mt-8 pt-2.5 border-t border-stone-300 text-center text-[9px] text-stone-500">
              Dokumen dicetak otomatis dari Sistem Informasi KhodamKu • Arsip Sah Buku Catatan Gaib
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
