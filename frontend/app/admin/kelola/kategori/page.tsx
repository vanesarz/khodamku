'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { Tag, Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface KategoriItem {
  id: number;
  nama: string;
  deskripsi: string;
  created_at?: string;
}

export default function AdminKelolaKategoriPage() {
  const [kategoris, setKategoris] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KategoriItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<KategoriItem | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/kelola/kategori');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setKategoris(json.data);
        }
      }
    } catch (err) {
      console.error('Fetch kategori error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const filteredKategoris = useMemo(() => {
    if (!searchQuery.trim()) return kategoris;
    const q = searchQuery.toLowerCase();
    return kategoris.filter(
      (k) => k.nama.toLowerCase().includes(q) || k.deskripsi.toLowerCase().includes(q)
    );
  }, [kategoris, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNama('');
    setDeskripsi('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: KategoriItem) => {
    setEditingItem(item);
    setNama(item.nama);
    setDeskripsi(item.deskripsi);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item: KategoriItem) => {
    setDeletingItem(item);
    setFormError(null);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nama.trim()) {
      setFormError('Nama kategori wajib diisi.');
      return;
    }
    if (!deskripsi.trim()) {
      setFormError('Deskripsi kategori wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        // Update
        const res = await fetch(`/api/admin/kelola/kategori/${editingItem.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: nama.trim(), deskripsi: deskripsi.trim() }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Gagal memperbarui kategori');
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Kategori "${nama}" berhasil diperbarui.`);
      } else {
        // Create
        const res = await fetch('/api/admin/kelola/kategori', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: nama.trim(), deskripsi: deskripsi.trim() }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || 'Gagal menambahkan kategori');
          setIsSubmitting(false);
          return;
        }

        setSuccessMsg(`Kategori "${nama}" berhasil ditambahkan.`);
      }

      setIsModalOpen(false);
      await fetchKategori();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Submit kategori error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/kelola/kategori/${deletingItem.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menghapus kategori');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Kategori "${deletingItem.nama}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
      await fetchKategori();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Delete kategori error:', err);
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
                Kelola Data Master
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Kategori Khodam</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[#d8b168]">
                  {kategoris.length} Kategori
                </span>
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                Kelola klasifikasi tuah, daya magis, dan khasiat entitas khodam di padepokan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-md active:scale-[0.99] shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kategori</span>
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

          {/* Search & Filter Toolbar */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                placeholder="Cari kategori atau deskripsi tuah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stone-800/80 bg-[#12100e] pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-stone-500 self-end sm:self-auto font-mono">
              Menampilkan {filteredKategoris.length} dari {kategoris.length} kategori
            </p>
          </div>

          {/* Categories Grid Table */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/80 bg-stone-900/40 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-16">No</th>
                    <th className="py-3.5 px-6 w-64">Nama Kategori</th>
                    <th className="py-3.5 px-6">Deskripsi Tuah / Khasiat</th>
                    <th className="py-3.5 px-6 text-right w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#d8b168]" />
                        <span>Memuat data kategori...</span>
                      </td>
                    </tr>
                  ) : filteredKategoris.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-stone-500">
                        <Tag className="h-8 w-8 mx-auto mb-2 text-stone-600" />
                        <p className="font-semibold text-stone-400">Tidak ada kategori ditemukan</p>
                        <p className="mt-1 text-[11px]">
                          {searchQuery ? 'Coba gunakan kata kunci pencarian lain.' : 'Mulai dengan menambahkan kategori baru.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredKategoris.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-stone-900/30 transition-colors group">
                        <td className="py-4 px-6 font-mono text-stone-500">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stone-800 bg-stone-900/80 text-[#d8b168]">
                              <Tag className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-semibold text-white group-hover:text-[#d8b168] transition-colors">
                              {item.nama}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-stone-400 leading-relaxed max-w-md">
                          {item.deskripsi}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-white hover:border-stone-700 hover:bg-stone-800 transition-colors"
                              title="Ubah Kategori"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30 transition-colors"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* Modal Tambah / Ubah Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg border border-stone-800 bg-stone-900 flex items-center justify-center text-[#d8b168]">
                  <Tag className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingItem ? 'Ubah Kategori Khodam' : 'Tambah Kategori Baru'}
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

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nama Kategori <span className="text-[#d8b168]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Penjaga Rumah, Kewibawaan..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Deskripsi Tuah / Manfaat <span className="text-[#d8b168]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan daya magis atau tuah yang dimiliki oleh kategori khodam ini..."
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
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-950/40 border border-rose-900/50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Kategori</h3>
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
              Apakah kamu yakin ingin menghapus kategori <span className="font-semibold text-white">"{deletingItem.nama}"</span>? Pastikan tidak ada khodam aktif yang menggunakan kategori ini.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingItem(null);
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
                <span>Hapus Kategori</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
