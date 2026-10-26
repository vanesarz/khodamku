'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { useAuth } from '@/hooks/useAuth';
import { formatRupiah } from '@/lib/utils';
import { getAnchoredTransactions, formatDateFull } from '@/lib/dateUtils';

function FormUlasan({ idPemanggilan, onBerhasil }: { idPemanggilan: number; onBerhasil: () => void }) {
  const [rating, setRating] = useState(5);
  const [ulasan, setUlasan] = useState('');
  const [loading, setLoading] = useState(false);
  const kirimUlasan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pemanggilan/${idPemanggilan}/ulasan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, ulasan }),
      });
      if (res.ok) {
        alert('ulasan berhasil dikirim!');
        onBerhasil();
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.message || 'gagal mengirim ulasan');
      }
    } catch (error) {
      alert('terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="bg-stone-900 border border-stone-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-[#d8b168]">
        <option value={5}>⭐ 5</option>
        <option value={4}>⭐ 4</option>
        <option value={3}>⭐ 3</option>
        <option value={2}>⭐ 2</option>
        <option value={1}>⭐ 1</option>
      </select>
      <input type="text" placeholder="tulis ulasan..." value={ulasan} onChange={(e) => setUlasan(e.target.value)} className="bg-stone-900 border border-stone-700 rounded p-1.5 text-xs w-28 text-white focus:outline-none focus:border-[#d8b168]" />
      <button onClick={kirimUlasan} disabled={loading} className="bg-[#d8b168] hover:bg-[#c49f5a] text-[#12100e] font-semibold px-3 py-1.5 rounded text-xs disabled:opacity-50 transition-colors">
        {loading ? '...' : 'kirim'}
      </button>
    </div>
  );
}

interface TransaksiRecord {
  id: number;
  kode_transaksi: string;
  khodam: {
    nama: string;
    kode_khodam: string;
  };
  tgl_panggil: string;
  tgl_panggil_formatted: string;
  tgl_jatuh_tempo: string;
  tgl_jatuh_tempo_formatted: string;
  tgl_pelepasan: string | null;
  tgl_pelepasan_formatted: string;
  mahar: number;
  mahar_formatted: string;
  status: 'Aktif' | 'Terlambat' | 'Dilepas';
  rating?: number | null;
}

export default function RiwayatPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('semua');
  const [dariTanggal, setDariTanggal] = useState('');
  const [sampaiTanggal, setSampaiTanggal] = useState('');
  const [invocations, setInvocations] = useState<any[]>([]);
  const [allAnchored, setAllAnchored] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [idSudahDiulas, setIdSudahDiulas] = useState<number[]>([]);

  useEffect(() => {
    setAllAnchored(getAnchoredTransactions());
    const loadData = async () => {
      try {
        setIsRefreshing(true);
        const res = await fetch('/api/pemanggilan');
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            setInvocations(json.data);
          }
        }
      } catch (err) {
        console.warn('Could not load user riwayat:', err);
      } finally {
        setIsRefreshing(false);
      }
    };
    loadData();
  }, [user]);

  // Transform invocations into TransaksiRecord format
  const transactions: TransaksiRecord[] = useMemo(() => {
    const userEmail = user?.email?.toLowerCase() || '';

    let userAnchored: any[] = [];
    if (userEmail.includes('sekar')) {
      userAnchored = allAnchored.filter((t) => t.pengamal_email.toLowerCase().includes('sekar'));
    } else if (userEmail.includes('bima')) {
      userAnchored = allAnchored.filter((t) => t.pengamal_email.toLowerCase().includes('bima'));
    } else if (userEmail.includes('raka') || userEmail.includes('pengamal@demo.test')) {
      userAnchored = allAnchored.filter((t) => t.pengamal_email.toLowerCase().includes('raka'));
    } else {
      userAnchored = [];
    }

    if (invocations.length > 0) {
      return invocations.map((item) => {
        const itemStatus: 'Aktif' | 'Terlambat' | 'Dilepas' = 
          String(item.status).toLowerCase() === 'dilepas'
            ? 'Dilepas'
            : item.is_terlambat
            ? 'Terlambat'
            : 'Aktif';

        return {
          id: item.id,
          kode_transaksi: item.kode_transaksi || `PMG-${item.id}`,
          khodam: {
            nama: item.khodam?.nama || 'Khodam Pendamping',
            kode_khodam: item.khodam?.kode_khodam || 'KHD-001',
          },
          tgl_panggil: item.tgl_panggil,
          tgl_panggil_formatted: formatDateFull(item.tgl_panggil),
          tgl_jatuh_tempo: item.tgl_jatuh_tempo,
          tgl_jatuh_tempo_formatted: formatDateFull(item.tgl_jatuh_tempo),
          tgl_pelepasan: item.tgl_pelepasan,
          tgl_pelepasan_formatted: item.tgl_pelepasan ? formatDateFull(item.tgl_pelepasan) : '—',
          mahar: item.mahar || 0,
          mahar_formatted:
            (item.mahar || 0) > 0
              ? itemStatus === 'Dilepas'
                ? formatRupiah(item.mahar)
                : `~${formatRupiah(item.mahar)}`
              : '~Rp0',
          status: itemStatus,
          rating: item.rating,
        };
      });
    }

    return userAnchored.map((item) => ({
      id: item.id,
      kode_transaksi: item.kode_transaksi,
      khodam: {
        nama: item.khodam.nama,
        kode_khodam: item.khodam.kode_khodam,
      },
      tgl_panggil: item.tgl_panggil_raw,
      tgl_panggil_formatted: item.tgl_panggil,
      tgl_jatuh_tempo: item.tgl_jatuh_tempo_raw,
      tgl_jatuh_tempo_formatted: item.tgl_jatuh_tempo,
      tgl_pelepasan: item.tgl_pelepasan_raw,
      tgl_pelepasan_formatted: item.tgl_pelepasan,
      mahar: item.mahar,
      mahar_formatted: item.mahar_formatted,
      status: item.status,
    }));
  }, [invocations, user, allAnchored]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return transactions.filter((item) => {
      if (item.rating != null || idSudahDiulas.includes(item.id)) return false;

      if (statusFilter !== 'semua') {
        if (statusFilter.toLowerCase() !== item.status.toLowerCase()) return false;
      }

      return true;
    });
  }, [transactions, statusFilter, idSudahDiulas]);

  const totalMahar = filteredData.reduce((acc, curr) => acc + curr.mahar, 0);

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4 flex items-center justify-between">
          <HeaderDate />
          {isRefreshing && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <RefreshCw className="h-3 w-3 animate-spin text-[#d8b168]" />
              <span>Memuat buku catatan gaib...</span>
            </div>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
              Riwayat Saya
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Buku Catatan Gaib
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Catatan seluruh khodam yang pernah bersemayam di ragamu.
            </p>
          </div>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Status Dropdown */}
            <div>
              <label
                htmlFor="status-filter"
                className="block text-xs text-stone-400 mb-1.5 font-medium"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-stone-800 bg-[#12100e] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors cursor-pointer"
                >
                  <option value="semua">Semua status</option>
                  <option value="aktif">Aktif</option>
                  <option value="terlambat">Terlambat</option>
                  <option value="dilepas">Dilepas</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              </div>
            </div>
          </div>

          {/* Data Table Panel */}
          <div className="overflow-hidden rounded-xl border border-stone-800/80 bg-[#12100e] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-stone-800/80 text-[10px] font-mono tracking-wider uppercase text-stone-500">
                    <th scope="col" className="py-4 px-6 font-semibold">
                      ID
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold">
                      Khodam
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold">
                      Dipanggil
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold">
                      Jatuh Tempo
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold">
                      Dilepas
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-right">
                      Mahar
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-center">
                      Status
                    </th>
                    <th scope="col" className="py-4 px-6 font-semibold text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-xs">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500">
                        Tidak ada riwayat transaksi yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-900/40 transition-colors"
                      >
                        {/* Transaction ID */}
                        <td className="py-4 px-6 font-mono text-stone-400">
                          {item.kode_transaksi}
                        </td>

                        {/* Khodam Name & Code */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-white text-sm">
                            {item.khodam.nama}
                          </p>
                          <p className="font-mono text-[10px] text-stone-500 uppercase mt-0.5">
                            {item.khodam.kode_khodam}
                          </p>
                        </td>

                        {/* Dipanggil Date */}
                        <td className="py-4 px-6 text-stone-300">
                          {item.tgl_panggil_formatted}
                        </td>

                        {/* Jatuh Tempo Date */}
                        <td className="py-4 px-6 text-stone-300">
                          {item.tgl_jatuh_tempo_formatted}
                        </td>

                        {/* Dilepas Date */}
                        <td className="py-4 px-6 text-stone-400">
                          {item.tgl_pelepasan_formatted}
                        </td>

                        {/* Mahar */}
                        <td className="py-4 px-6 text-right font-medium text-stone-300">
                          {item.mahar_formatted}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6 text-center">
                          {item.status === 'Aktif' && (
                            <span className="inline-flex items-center rounded-full border border-emerald-900/50 bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                              Aktif
                            </span>
                          )}
                          {item.status === 'Dilepas' && (
                            <span className="inline-flex items-center rounded-full border border-stone-800 bg-stone-900/40 px-2.5 py-0.5 text-[11px] font-medium text-stone-400">
                              Dilepas
                            </span>
                          )}
                          {item.status === 'Terlambat' && (
                            <span className="inline-flex items-center rounded-full border border-amber-900/50 bg-amber-950/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-500">
                              Terlambat
                            </span>
                          )}
                        </td>

                        {/* Aksi Kolom (Ulasan) */}
                        <td className="py-4 px-6 text-center">
                          {item.status === 'Dilepas' ? (
                            <FormUlasan
                              idPemanggilan={item.id}
                              onBerhasil={() => setIdSudahDiulas((prev) => [...prev, item.id])}
                            />
                          ) : (
                            <span className="text-stone-600 font-medium">-</span>
                            
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Summary Footer */}
            <div className="flex items-center justify-between border-t border-stone-800/80 px-6 py-4 bg-[#0e0c0b] text-xs">
              <span className="text-stone-400">
                {filteredData.length} transaksi
              </span>
              <span className="font-bold text-white text-sm">
                {totalMahar === 0 ? 'Rp0' : formatRupiah(totalMahar)}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}