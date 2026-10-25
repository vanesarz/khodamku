'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import { Users, Plus, Search, Pencil, Trash2, X, AlertCircle, CheckCircle2, Loader2, Shield, User as UserIcon, Phone, MapPin, Calendar } from 'lucide-react';

interface UserProfile {
  id?: number;
  no_hp?: string;
  alamat?: string;
  weton?: string;
  tanggal_lahir?: string;
  foto?: string | null;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'pengamal';
  created_at?: string;
  profile?: UserProfile | null;
}

export default function AdminKelolaUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'pengamal' | 'admin'>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<'pengamal' | 'admin'>('pengamal');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setUsers(json.data);
        }
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchPhone = u.profile?.no_hp?.toLowerCase().includes(q);
        const matchAddress = u.profile?.alamat?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchAddress) return false;
      }

      return true;
    });
  }, [users, roleFilter, searchQuery]);

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPasswordConfirmation('');
    setRole('pengamal');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setNoHp(u.profile?.no_hp && u.profile.no_hp !== '-' ? u.profile.no_hp : '');
    setAlamat(u.profile?.alamat && u.profile.alamat !== '-' ? u.profile.alamat : '');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (u: UserItem) => {
    setDeletingUser(u);
    setFormError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !password) {
      setFormError('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setFormError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    if (password !== passwordConfirmation) {
      setFormError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal mendaftarkan akun pengguna');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Akun ${role === 'admin' ? 'Juru Kunci' : 'Pengamal'} "${name}" berhasil didaftarkan.`);
      setIsAddModalOpen(false);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Create user error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);

    if (!name.trim() || !email.trim()) {
      setFormError('Nama dan email wajib diisi.');
      return;
    }

    if (password && password.length < 8) {
      setFormError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          no_hp: noHp.trim(),
          alamat: alamat.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const firstError = data.errors ? (Object.values(data.errors)[0] as string[])?.[0] : null;
        setFormError(firstError || data.error || 'Gagal memperbarui data pengguna');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Data akun "${name.trim()}" berhasil diperbarui.`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Update user error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menghapus pengguna');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(`Akun "${deletingUser.name}" berhasil dihapus.`);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Delete user error:', err);
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pengamalCount = users.filter((u) => u.role === 'pengamal').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

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
                Kelola Data Anggota
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>Pengamal & Juru Kunci</span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[#d8b168]">
                  {users.length} Akun
                </span>
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                Kelola data pengamal terdaftar, profil pengguna, dan otorisasi juru kunci padepokan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-[#d8b168] px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-[#c99f52] transition-colors shadow-md active:scale-[0.99] shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Daftarkan Pengguna</span>
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

          {/* Search, Filter Toolbar, and Role Counts */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Cari nama, email, no HP, atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stone-800/80 bg-[#12100e] pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none transition-colors"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-stone-800 bg-[#12100e] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    roleFilter === 'all' ? 'bg-[#d8b168] text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Semua ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('pengamal')}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    roleFilter === 'pengamal' ? 'bg-[#d8b168] text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Pengamal ({pengamalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    roleFilter === 'admin' ? 'bg-[#d8b168] text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Juru Kunci ({adminCount})
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-500 font-mono self-end sm:self-auto">
              Menampilkan {filteredUsers.length} pengguna
            </p>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-stone-800/80 bg-[#12100e] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-800/80 bg-stone-900/40 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6 w-16">No</th>
                    <th className="py-3.5 px-6">Identitas Pengguna</th>
                    <th className="py-3.5 px-6 w-36">Peran</th>
                    <th className="py-3.5 px-6">Kontak & Alamat</th>
                    <th className="py-3.5 px-6 w-32">Weton</th>
                    <th className="py-3.5 px-6 text-right w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#d8b168]" />
                        <span>Memuat data pengguna...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-500">
                        <Users className="h-8 w-8 mx-auto mb-2 text-stone-600" />
                        <p className="font-semibold text-stone-400">Tidak ada pengguna ditemukan</p>
                        <p className="mt-1 text-[11px]">
                          {searchQuery ? 'Coba periksa kembali kata kunci pencarian.' : 'Belum ada data anggota yang terdaftar.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((item, idx) => {
                      const isAdmin = item.role === 'admin';
                      return (
                        <tr key={item.id} className="hover:bg-stone-900/30 transition-colors group">
                          <td className="py-4 px-6 font-mono text-stone-500">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-xs font-bold text-stone-300">
                                {item.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white group-hover:text-[#d8b168] transition-colors truncate">
                                  {item.name}
                                </p>
                                <p className="text-[11px] font-mono text-stone-400 truncate">
                                  {item.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                isAdmin
                                  ? 'border-amber-500/30 bg-amber-950/20 text-amber-400'
                                  : 'border-stone-700 bg-stone-900/70 text-stone-300'
                              }`}
                            >
                              {isAdmin ? <Shield className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                              <span>{isAdmin ? 'Juru Kunci' : 'Pengamal'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-stone-300">
                            <div className="space-y-0.5">
                              <p className="text-[11px] text-stone-300 flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-stone-500 shrink-0" />
                                <span>{item.profile?.no_hp || '—'}</span>
                              </p>
                              <p className="text-[11px] text-stone-400 truncate max-w-xs flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-stone-500 shrink-0" />
                                <span>{item.profile?.alamat || '—'}</span>
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-stone-400">
                            {item.profile?.weton || '—'}
                          </td>
                          <td className="py-4 px-6 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-[#d8b168] hover:border-[#d8b168]/40 hover:bg-[#d8b168]/10 transition-colors"
                              title="Ubah Data Pengguna"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(item)}
                              className="p-1.5 rounded-lg border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/30 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
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

      {/* Modal Tambah Pengguna */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg border border-stone-800 bg-stone-900 flex items-center justify-center text-[#d8b168]">
                  <Users className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Daftarkan Pengguna Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Peran Akun <span className="text-[#d8b168]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('pengamal')}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                      role === 'pengamal'
                        ? 'border-[#d8b168] bg-[#d8b168]/10 text-[#d8b168]'
                        : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:text-white'
                    }`}
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Pengamal (User)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-all ${
                      role === 'admin'
                        ? 'border-[#d8b168] bg-[#d8b168]/10 text-[#d8b168]'
                        : 'border-stone-800 bg-stone-900/40 text-stone-400 hover:text-white'
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5" />
                    <span>Juru Kunci (Admin)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nama Lengkap <span className="text-[#d8b168]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Misal: Raden Mas Danang..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Alamat Email <span className="text-[#d8b168]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="pengamal@khodamku.test"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Kata Sandi <span className="text-[#d8b168]">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Konfirmasi Sandi <span className="text-[#d8b168]">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Ulangi sandi"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  <span>Daftarkan Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Pengguna */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg border border-stone-800 bg-stone-900 flex items-center justify-center text-[#d8b168]">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Ubah Data Pengguna
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="mt-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nama Lengkap <span className="text-[#d8b168]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Alamat Email <span className="text-[#d8b168]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak diubah"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Nomor HP
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Alamat
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Kenanga No. 12, Sleman"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full rounded-lg border border-stone-800 bg-stone-900/60 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-[#d8b168] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-stone-800 bg-[#12100e] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="h-10 w-10 rounded-full bg-rose-950/40 border border-rose-900/50 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Hapus Pengguna</h3>
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
              Apakah kamu yakin ingin menghapus akun <span className="font-semibold text-white">"{deletingUser.name}"</span> ({deletingUser.email})? Seluruh data profil dan riwayat terkait akan terhapus.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingUser(null);
                  setFormError(null);
                }}
                className="rounded-lg border border-stone-800 px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Hapus Pengguna</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
