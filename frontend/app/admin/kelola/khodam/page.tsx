'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { Sparkles, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2, Loader2, Star, Shield, Tag } from 'lucide-react';
import { Khodam } from '@/types';
import { MASTER_KHODAMS } from '@/lib/khodamData';

interface KategoriOption {
  id: number;
  nama: string;
}

export default function AdminKelolaKhodamPage() {
  const [khodams, setKhodams] = useState<Khodam[]>([]);
  const [categories, setCategories] = useState<KategoriOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingKhodam, setEditingKhodam] = useState<Khodam | null>(null);
  const [deletingKhodam, setDeletingKhodam] = useState<Khodam | null>(null);

  // Form states
  const [kodeKhodam, setKodeKhodam] = useState('');
  const [nama, setNama] = useState('');
  const [asal, setAsal] = useState('');
  const [levelKekuatan, setLevelKekuatan] = useState<number>(3);
  const [deskripsi, setDeskripsi] = useState('');
  const [selectedKategoriIds, setSelectedKategoriIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resKhodams, resCats] = await Promise.all([
        fetch('/api/admin/khodam'),
        fetch('/api/admin/kelola/kategori'),
      ]);

      if (resKhodams.ok) {
        const json = await resKhodams.json();
        if (json.data && Array.isArray(json.data)) {
          setKhodams(json.data);
        }
      }

      if (resCats.ok) {
        const jsonC = await resCats.json();
        if (jsonC.data && Array.isArray(jsonC.data)) {
          setCategories(jsonC.data.map((c: any) => ({ id: c.id, nama: c.nama })));
        }
      }
    } catch (err) {
      console.error('Fetch khodams error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredKhodams = useMemo(() => {
    return khodams.filter((k) => {
      // Category filter
      if (selectedKategori !== 'Semua') {
        const hasCategory = k.kategoris.some(
          (c) => c.nama.toLowerCase() === selectedKategori.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = k.nama.toLowerCase().includes(q);
        const matchCode = k.kode_khodam.toLowerCase().includes(q);
        const matchAsal = k.asal.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchAsal) return false;
      }

      return true;
    });
  }, [khodams, selectedKategori, searchQuery]);

  const handleOpenAdd = () => {
    setEditingKhodam(null);
    setKodeKhodam(`KHD-${Math.random().toString(36).substring(2, 5).toUpperCase()}-001`);
    setNama('');
    setAsal('');
    setLevelKekuatan(3);
    setDeskripsi('');
    setSelectedKategoriIds(categories.length > 0 ? [categories[0].id] : []);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Khodam) => {
    setEditingKhodam(item);
    setKodeKhodam(item.kode_khodam);
    setNama(item.nama);
    setAsal(item.asal);
    setLevelKekuatan(item.level_kekuatan);
    setDeskripsi(item.deskripsi || '');
    setSelectedKategoriIds(item.kategoris.map((c) => c.id));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: Khodam) => {
    setDeletingKhodam(item);
    setFormError(null);
    setIsDeleteModalOpen(true);
  };

  const toggleKategori = (catId: number) => {
    setSelectedKategoriIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!kodeKhodam.trim() || !nama.trim() || !asal.trim() || !deskripsi.trim()) {
      setFormError('Semua kolom bertanda bintang wajib diisi.');
      return;
    }

    if (selectedKategoriIds.length === 0) {
      setFormError('Pilih minimal satu kategori khodam.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingKhodam) {
        // Update
        const res = await fetch(`/api/admin/khodam/${editingKhodam.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kode_khodam: kodeKhodam.trim(),
            nama: nama.trim(),
            asal: asal.trim(),
            level_kekuatan: levelKekuatan,
            deskripsi: deskripsi.trim(),
            kategori_ids: selectedKategoriIds,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Gagal memperbarui data khodam');
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Khodam "${nama}" berhasil diperbarui.`);
      } else {
        // Create
        const res = await fetch('/api/admin/khodam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kode_khodam: kodeKhodam.trim(),
            nama: nama.trim(),
            asal: asal.trim(),
            level_kekuatan: levelKekuatan,
            deskripsi: deskripsi.trim(),
            kategori_ids: selectedKategoriIds,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Gagal menambahkan khodam baru');
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Khodam "${nama}" (${kodeKhodam}) berhasil ditambahkan ke padepokan.`);
      }

      setIsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Submit khodam error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingKhodam) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/khodam/${deletingKhodam.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menghapus khodam');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Khodam "${deletingKhodam.nama}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingKhodam(null);
      await fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Delete khodam error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4">
          <HeaderDate />
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
                Kelola Inventaris Padepokan
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Master Khodam</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[#d8b168]">
                  {khodams.length} Entitas
                </span>
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                Tambah, perbarui, dan kontrol seluruh entitas khodam yang bersemayam di padepokan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-md active:scale-[0.99] shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Khodam Baru</span>
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300 shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Search & Category Filter Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Cari nama khodam, kode unit, atau asal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-800/80 bg-[#12100e] pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none transition-colors"
                />
              </div>

              {/* Kategori Select */}
              <div className="w-full sm:w-52">
                <select
                  value={selectedKategori}
                  onChange={(e) => setSelectedKategori(e.target.value)}
                  className="w-full rounded-lg border border-stone-800/80 bg-[#12100e] px-3.5 py-2.5 text-xs text-white focus:border-[#d8b168] focus:outline-none transition-colors"
                >
                  <option value="Semua">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.nama}>
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-stone-500 font-mono self-end sm:self-auto">
              Menampilkan {filteredKhodams.length} entitas
            </p>
          </div>

          {/* Khodams Table */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/80 bg-stone-900/40 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Entitas Khodam</th>
                    <th className="py-3.5 px-6 w-36">Asal Daerah</th>
                    <th className="py-3.5 px-6 w-28">Kekuatan</th>
                    <th className="py-3.5 px-6">Kategori Tuah</th>
                    <th className="py-3.5 px-6 w-36">Status</th>
                    <th className="py-3.5 px-6 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#d8b168]" />
                        <span>Memuat inventaris khodam...</span>
                      </td>
                    </tr>
                  ) : filteredKhodams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 text-stone-600" />
                        <p className="font-semibold text-stone-400">Tidak ada khodam ditemukan</p>
                        <p className="mt-1 text-[11px]">
                          {searchQuery ? 'Coba ubah kata kunci atau kategori filter.' : 'Tambahkan unit khodam baru ke padepokan.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredKhodams.map((item) => {
                      const sigil = item.kode_khodam.split('-')[1] || 'KHD';
                      const isBersemayam = item.status === 'Sedang Bersemayam';
                      return (
                        <tr key={item.id} className="hover:bg-stone-900/30 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-xs font-mono font-bold text-stone-200">
                                {sigil}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white group-hover:text-[#d8b168] transition-colors truncate">
                                  {item.nama}
                                </p>
                                <p className="text-[10px] font-mono text-stone-400 truncate">
                                  {item.kode_khodam}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-stone-300">
                            {item.asal}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="h-3.5 w-3.5 fill-amber-400" />
                              <span className="font-bold text-xs">{item.level_kekuatan}</span>
                              <span className="text-[10px] text-stone-500">/5</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-wrap gap-1.5 max-w-xs">
                              {item.kategoris.map((c) => (
                                <span
                                  key={c.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-stone-900 border border-stone-800 text-stone-300"
                                >
                                  {c.nama}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                isBersemayam
                                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                                  : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isBersemayam ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                              <span>{isBersemayam ? 'Sedang Bersemayam' : 'Menunggu Dipanggil'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-white hover:border-stone-700 hover:bg-stone-800 transition-colors"
                                title="Ubah Khodam"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(item)}
                                className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30 transition-colors"
                                title="Hapus Khodam"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
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

      {/* Modal Tambah / Ubah Khodam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg border border-stone-800 bg-stone-900 flex items-center justify-center text-[#d8b168]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingKhodam ? 'Ubah Data Entitas Khodam' : 'Tambah Entitas Khodam Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Kode Khodam (Unik) <span className="text-[#d8b168]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KHD-MCP-001"
                    value={kodeKhodam}
                    onChange={(e) => setKodeKhodam(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 font-mono uppercase focus:border-[#d8b168] focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-[10px] text-stone-500">Pembeda unit jika nama sama.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Nama Entitas <span className="text-[#d8b168]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Macan Putih, Naga Hijau..."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Asal Daerah / Petilasan <span className="text-[#d8b168]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gunung Lawu, Alas Purwo..."
                    value={asal}
                    onChange={(e) => setAsal(e.target.value)}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Level Daya Kekuatan (1 - 5) <span className="text-[#d8b168]">*</span>
                  </label>
                  <select
                    value={levelKekuatan}
                    onChange={(e) => setLevelKekuatan(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white focus:border-[#d8b168] focus:outline-none"
                  >
                    <option value={1}>Level 1 - Tuah Ringan</option>
                    <option value={2}>Level 2 - Penjaga Dasar</option>
                    <option value={3}>Level 3 - Tuah Menengah</option>
                    <option value={4}>Level 4 - Sakti Mandraguna</option>
                    <option value={5}>Level 5 - Pusaka Pamungkas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Kategori Tuah (Multiple) <span className="text-[#d8b168]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-lg border border-stone-800 bg-stone-900/40 max-h-36 overflow-y-auto">
                  {categories.map((c) => {
                    const isSelected = selectedKategoriIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleKategori(c.id)}
                        className={`flex items-center gap-2 p-2 rounded-md border text-left text-[11px] transition-all ${
                          isSelected
                            ? 'border-[#d8b168] bg-[#d8b168]/10 text-white font-semibold'
                            : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-white'
                        }`}
                      >
                        <Tag className={`h-3 w-3 ${isSelected ? 'text-[#d8b168]' : 'text-stone-500'}`} />
                        <span className="truncate">{c.nama}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Deskripsi & Cerita Latar <span className="text-[#d8b168]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Riwayat pertapaan, pantangan, dan tuah entitas khodam..."
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none resize-none"
                  required
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-stone-800 px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2 text-xs font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingKhodam ? 'Simpan Perubahan' : 'Tambah Khodam'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deletingKhodam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-950/40 border border-rose-900/50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Entitas Khodam</h3>
                <p className="text-[11px] text-stone-400">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <p className="text-xs text-stone-300 leading-relaxed mb-5">
              Apakah kamu yakin ingin menghapus <span className="font-semibold text-white">"{deletingKhodam.nama}"</span> ({deletingKhodam.kode_khodam}) dari padepokan?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingKhodam(null);
                  setFormError(null);
                }}
                className="rounded-lg border border-stone-800 px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Hapus Khodam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
