'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import LepasKhodamModal from '@/components/features/LepasKhodamModal';
import {
  CheckCircle2,
  X,
  RefreshCw,
  Check,
  Ban,
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface PemanggilanRecord {
  id: number;
  kode_transaksi: string;
  pengamal: string;
  khodam: {
    nama: string;
    kode_khodam: string;
    sigil: string;
  };
  status?: string;
  tgl_panggil: string;
  tgl_jatuh_tempo: string;
  status_badge: string;
  estimasi_mahar: string;
  catatan_admin?: string;
  is_terlambat: boolean;
}

type TabType = 'permintaan_panggil' | 'permintaan_lepas' | 'semua' | 'terlambat' | 'masih_berjalan';

export default function AdminPemanggilanAktifPage() {
  const [activeTab, setActiveTab] = useState<TabType>('permintaan_panggil');
  const [records, setRecords] = useState<PemanggilanRecord[]>([]);
  const [tabCounts, setTabCounts] = useState({
    semua: 0,
    terlambat: 0,
    masih_berjalan: 0,
    permintaan_panggil: 0,
    permintaan_lepas: 0,
  });

  // Modal states
  const [selectedLepasItem, setSelectedLepasItem] = useState<PemanggilanRecord | null>(null);
  const [isLepasModalOpen, setIsLepasModalOpen] = useState(false);
  const [isSubmittingLepas, setIsSubmittingLepas] = useState(false);

  // Reject Modal state
  const [rejectingItem, setRejectingItem] = useState<{
    id: number;
    type: 'panggil' | 'lepas';
    namaKhodam: string;
    pengamal: string;
  } | null>(null);
  const [rejectCatatan, setRejectCatatan] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Quick Action Loading state (for Approve Panggil)
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch records for the active tab from API
  const fetchPemanggilan = useCallback(async (tabToFetch: TabType) => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/admin/pemanggilan?tab=${tabToFetch}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setRecords(json.data);
        }
        if (json.tabs) {
          setTabCounts({
            semua: json.tabs.semua || 0,
            terlambat: json.tabs.terlambat || 0,
            masih_berjalan: json.tabs.masih_berjalan || 0,
            permintaan_panggil: json.tabs.permintaan_panggil || 0,
            permintaan_lepas: json.tabs.permintaan_lepas || 0,
          });
        }
      }
    } catch (err) {
      console.warn('Error fetching admin pemanggilan:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPemanggilan(activeTab);
  }, [activeTab, fetchPemanggilan]);

  // 1. Approve summon request
  const handleApprovePanggil = async (item: PemanggilanRecord) => {
    setApprovingId(item.id);
    try {
      const res = await fetch(`/api/admin/pemanggilan/${item.id}/setujui-panggil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: 'Disetujui oleh Juru Kunci' }),
      });
      const json = await res.json();

      if (res.ok) {
        setNotification({
          type: 'success',
          message:
            json.message ||
            `Permintaan pemanggilan khodam ${item.khodam.nama} untuk ${item.pengamal} berhasil disetujui!`,
        });
        await fetchPemanggilan(activeTab);
      } else {
        setNotification({
          type: 'error',
          message: json.error || 'Gagal menyetujui pemanggilan.',
        });
      }
    } catch (err) {
      console.error('Error approving panggil:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi gangguan saat menyetujui pemanggilan.',
      });
    } finally {
      setApprovingId(null);
    }
  };

  // 2. Reject modal confirm
  const handleConfirmReject = async () => {
    if (!rejectingItem) return;

    setIsSubmittingReject(true);
    try {
      const endpoint =
        rejectingItem.type === 'panggil'
          ? `/api/admin/pemanggilan/${rejectingItem.id}/tolak-panggil`
          : `/api/admin/pemanggilan/${rejectingItem.id}/tolak-lepas`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catatan: rejectCatatan.trim() || undefined }),
      });
      const json = await res.json();

      if (res.ok) {
        setNotification({
          type: 'success',
          message:
            json.message ||
            (rejectingItem.type === 'panggil'
              ? `Permintaan pemanggilan khodam ${rejectingItem.namaKhodam} telah ditolak.`
              : `Permintaan pelepasan khodam ${rejectingItem.namaKhodam} telah ditolak.`),
        });
        setRejectingItem(null);
        setRejectCatatan('');
        await fetchPemanggilan(activeTab);
      } else {
        setNotification({
          type: 'error',
          message: json.error || 'Gagal memproses penolakan.',
        });
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan saat memproses penolakan.',
      });
    } finally {
      setIsSubmittingReject(false);
    }
  };

  // 3. Confirm release (approving release request or manual admin release)
  const handleConfirmLepas = async (id: number) => {
    setIsSubmittingLepas(true);
    try {
      const isReleaseApproval =
        selectedLepasItem?.status === 'Menunggu Pelepasan' ||
        selectedLepasItem?.status === 'menunggu_pelepasan';

      const endpoint = isReleaseApproval
        ? `/api/admin/pemanggilan/${id}/setujui-lepas`
        : `/api/admin/pemanggilan/${id}/lepas`;

      const res = await fetch(endpoint, {
        method: 'POST',
      });
      const result = await res.json();

      setNotification({
        type: 'success',
        message:
          result.message ||
          `Khodam ${selectedLepasItem?.khodam.nama} berhasil dilepaskan dari ${selectedLepasItem?.pengamal}. Kontrak telah selesai.`,
      });

      setIsLepasModalOpen(false);
      setSelectedLepasItem(null);
      await fetchPemanggilan(activeTab);
    } catch (err) {
      console.error('Error releasing khodam:', err);
      setNotification({
        type: 'error',
        message: 'Terjadi kesalahan saat memproses pelepasan.',
      });
    } finally {
      setIsSubmittingLepas(false);
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
              Operasional Padepokan
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Persetujuan & Pemanggilan
            </h1>
            <p className="mt-2 text-sm text-stone-400">
              Tinjau permohonan peminjaman khodam baru dan pengesahan pelepasan khodam dari para pengamal.
            </p>
          </div>

          {/* Success / Error Banner */}
          {notification && (
            <div
              className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-3.5 text-xs animate-in fade-in duration-300 ${
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-stone-800/80 mb-6 overflow-x-auto pb-px">
            {/* 1. Tab Permintaan Panggil */}
            <button
              type="button"
              onClick={() => setActiveTab('permintaan_panggil')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'permintaan_panggil'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Permintaan Panggil</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  tabCounts.permintaan_panggil > 0
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'text-stone-500 bg-stone-900 border border-stone-800'
                }`}
              >
                {tabCounts.permintaan_panggil}
              </span>
              {activeTab === 'permintaan_panggil' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            {/* 2. Tab Permintaan Lepas */}
            <button
              type="button"
              onClick={() => setActiveTab('permintaan_lepas')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'permintaan_lepas'
                  ? 'text-white'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Permintaan Lepas</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  tabCounts.permintaan_lepas > 0
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 animate-pulse'
                    : 'text-stone-500 bg-stone-900 border border-stone-800'
                }`}
              >
                {tabCounts.permintaan_lepas}
              </span>
              {activeTab === 'permintaan_lepas' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            {/* 3. Tab Semua Aktif */}
            <button
              type="button"
              onClick={() => setActiveTab('semua')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'semua' ? 'text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Semua Aktif</span>
              <span className={`text-xs ${activeTab === 'semua' ? 'text-stone-400' : 'text-stone-500'}`}>
                {tabCounts.semua}
              </span>
              {activeTab === 'semua' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            {/* 4. Tab Terlambat */}
            <button
              type="button"
              onClick={() => setActiveTab('terlambat')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'terlambat' ? 'text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Terlambat</span>
              <span
                className={`text-xs ${
                  tabCounts.terlambat > 0 ? 'text-amber-400 font-bold' : 'text-stone-500'
                }`}
              >
                {tabCounts.terlambat}
              </span>
              {activeTab === 'terlambat' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d8b168]" />
              )}
            </button>

            {/* 5. Tab Masih Berjalan */}
            <button
              type="button"
              onClick={() => setActiveTab('masih_berjalan')}
              className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'masih_berjalan' ? 'text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>Masih Berjalan</span>
              <span className={`text-xs ${activeTab === 'masih_berjalan' ? 'text-stone-400' : 'text-stone-500'}`}>
                {tabCounts.masih_berjalan}
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
                      {activeTab === 'permintaan_panggil' ? 'Tgl Diajukan' : 'Dipanggil'}
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
                      <span>Tindakan Juru Kunci</span>
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-stone-800/60">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-sm text-stone-500">
                        Tidak ada catatan pemanggilan pada kategori ini.
                      </td>
                    </tr>
                  ) : (
                    records.map((item) => {
                      const statusStr = String(item.status || '').toLowerCase().trim();
                      const isPendingPanggil =
                        statusStr === 'menunggu_persetujuan' || statusStr === 'menunggu persetujuan';
                      const isPendingLepas =
                        statusStr === 'menunggu_pelepasan' || statusStr === 'menunggu pelepasan';

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-900/40 transition-colors text-xs"
                        >
                          {/* Khodam Identity */}
                          <td className="py-4 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-800 bg-stone-900 text-xs font-mono font-bold text-amber-300">
                                {item.khodam?.sigil ||
                                  item.khodam?.kode_khodam?.split('-')[1] ||
                                  'KHD'}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">
                                  {item.khodam?.nama}
                                </p>
                                <p className="text-[10px] font-mono text-stone-500 uppercase">
                                  {item.khodam?.kode_khodam} &middot; {item.kode_transaksi}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Pengamal */}
                          <td className="py-4 px-4 font-medium text-stone-200">
                            {item.pengamal}
                          </td>

                          {/* Dipanggil / Diajukan */}
                          <td className="py-4 px-4 text-stone-400">
                            {item.tgl_panggil}
                          </td>

                          {/* Jatuh Tempo */}
                          <td className="py-4 px-4 text-stone-400">
                            {item.tgl_jatuh_tempo}
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4">
                            {isPendingPanggil ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span>Menunggu Persetujuan</span>
                              </span>
                            ) : isPendingLepas ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950/30 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                                <span>Menunggu Pelepasan</span>
                              </span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                                  item.is_terlambat
                                    ? 'border border-amber-500/40 bg-amber-950/30 text-amber-300'
                                    : 'border border-stone-800 bg-stone-900/60 text-stone-300'
                                }`}
                              >
                                {item.status_badge}
                              </span>
                            )}
                          </td>

                          {/* Estimasi Mahar */}
                          <td className="py-4 px-4">
                            <span
                              className={`font-mono text-xs font-semibold ${
                                item.is_terlambat ? 'text-amber-400 font-bold' : 'text-stone-300'
                              }`}
                            >
                              {item.estimasi_mahar}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 pl-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* 1. Jika Permintaan Pemanggilan: Setujui & Tolak */}
                              {isPendingPanggil ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprovePanggil(item)}
                                    disabled={approvingId === item.id}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                                  >
                                    {approvingId === item.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                    <span>Setujui</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectingItem({
                                        id: item.id,
                                        type: 'panggil',
                                        namaKhodam: item.khodam?.nama || 'Khodam',
                                        pengamal: item.pengamal,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/50 px-2.5 py-1.5 text-[11px] font-semibold text-red-300 transition-colors cursor-pointer"
                                  >
                                    <Ban className="h-3 w-3" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              ) : isPendingLepas ? (
                                /* 2. Jika Permintaan Pelepasan: Setujui Pelepasan & Tolak */
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedLepasItem(item);
                                      setIsLepasModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg bg-[#d8b168] hover:bg-[#c99f52] px-3 py-1.5 text-[11px] font-bold text-stone-950 transition-colors cursor-pointer shadow-sm"
                                  >
                                    <Sparkles className="h-3 w-3" />
                                    <span>Setujui Pelepasan</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectingItem({
                                        id: item.id,
                                        type: 'lepas',
                                        namaKhodam: item.khodam?.nama || 'Khodam',
                                        pengamal: item.pengamal,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 bg-red-950/20 hover:bg-red-950/50 px-2.5 py-1.5 text-[11px] font-semibold text-red-300 transition-colors cursor-pointer"
                                  >
                                    <Ban className="h-3 w-3" />
                                    <span>Tolak</span>
                                  </button>
                                </>
                              ) : (
                                /* 3. Jika Aktif / Terlambat: Lepas Langsung oleh Admin */
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLepasItem(item);
                                    setIsLepasModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg border border-stone-700 bg-stone-900/80 hover:bg-stone-800 px-3 py-1.5 text-[11px] font-medium text-stone-300 hover:text-white transition-colors cursor-pointer"
                                >
                                  <span>Lepas Khodam</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Pelepasan Khodam */}
      <LepasKhodamModal
        item={selectedLepasItem}
        onClose={() => {
          setIsLepasModalOpen(false);
          setSelectedLepasItem(null);
        }}
        onConfirm={handleConfirmLepas}
        loading={isSubmittingLepas}
      />

      {/* Modal Penolakan (Reject Prompt with optional note) */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-stone-800 bg-[#141210] p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setRejectingItem(null);
                setRejectCatatan('');
              }}
              disabled={isSubmittingReject}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase text-red-400 tracking-wider">
                  Konfirmasi Penolakan
                </p>
                <h3 className="text-base font-bold text-white">
                  {rejectingItem.type === 'panggil'
                    ? `Tolak Pemanggilan ${rejectingItem.namaKhodam}`
                    : `Tolak Pelepasan ${rejectingItem.namaKhodam}`}
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-300 mb-4 leading-relaxed">
              Pengamal: <span className="font-semibold text-white">{rejectingItem.pengamal}</span>.
              {rejectingItem.type === 'panggil'
                ? ' Khodam tidak akan bersemayam dan unit khodam akan kembali tersedia di katalog.'
                : ' Khodam akan tetap bersemayam di raga pengamal dan status kontrak tetap aktif.'}
            </p>

            <div className="mb-5">
              <label className="block text-xs text-stone-400 mb-1.5">
                Alasan / Catatan Penolakan (Opsional):
              </label>
              <input
                type="text"
                value={rejectCatatan}
                onChange={(e) => setRejectCatatan(e.target.value)}
                placeholder="Mis: Aura spiritual belum selaras..."
                className="w-full rounded-lg border border-stone-800 bg-[#0c0a09] px-3 py-2 text-xs text-white placeholder-stone-600 focus:border-[#d8b168] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-800/80">
              <button
                type="button"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectCatatan('');
                }}
                disabled={isSubmittingReject}
                className="rounded-lg px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReject ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-3.5 w-3.5" />
                    <span>Tolak Permintaan</span>
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
