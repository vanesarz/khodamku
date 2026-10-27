'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Search, Filter, ShieldCheck } from 'lucide-react';
import { Khodam } from '@/types';
import { MASTER_KHODAMS } from '@/lib/khodamData';
import { useAuth } from '@/hooks/useAuth';
import KhodamDetailModal from './KhodamDetailModal';
import RitualPemanggilanModal from '@/components/features/RitualPemanggilanModal';

interface CategoryItem {
  id?: number;
  nama: string;
  deskripsi?: string | null;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 1, nama: 'Penjaga Rumah', deskripsi: 'Menjaga dari pagar gaib dan santet tanah.' },
  { id: 2, nama: 'Penglaris Dagangan', deskripsi: 'Membantu kelancaran transaksi & rezeki halal.' },
  { id: 3, nama: 'Pelindung Ujian', deskripsi: 'Membantu ketenangan batin, kejernihan pikiran, dan fokus belajar.' },
  { id: 4, nama: 'Kewibawaan', deskripsi: 'Mengangkat pamor dan daya pikat persona.' },
  { id: 5, nama: 'Penolak Bala', deskripsi: 'Menangkal teluh, santet, dan marabahaya gaib.' },
  { id: 6, nama: 'Pencari Jodoh', deskripsi: 'Membuka pancaran aura asmara dan jodoh sejati.' },
];

export default function KatalogSection() {
  const { user } = useAuth();
  const [khodams, setKhodams] = useState<Khodam[]>(MASTER_KHODAMS);
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [userInvocations, setUserInvocations] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);
  const [selectedKhodam, setSelectedKhodam] = useState<Khodam | null>(null);
  const [ritualKhodam, setRitualKhodam] = useState<Khodam | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load live khodams, categories, and user invocations from database API
  const loadData = async () => {
    try {
      const [resKhodams, resCategories, resPemanggilan] = await Promise.all([
        fetch('/api/khodams'),
        fetch('/api/kategori'),
        fetch('/api/pemanggilan'),
      ]);

      if (resKhodams.ok) {
        const jsonK = await resKhodams.json();
        if (jsonK.data && Array.isArray(jsonK.data)) {
          setKhodams(jsonK.data);
        }
      }

      if (resCategories.ok) {
        const jsonC = await resCategories.json();
        if (jsonC.data && Array.isArray(jsonC.data)) {
          setCategories(jsonC.data);
        }
      }

      if (resPemanggilan.ok) {
        const jsonP = await resPemanggilan.json();
        if (jsonP.data && Array.isArray(jsonP.data)) {
          setUserInvocations(jsonP.data);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data katalog landing page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Compute active slots for logged-in pengamal
  const activeCount = useMemo(() => {
    const actives = userInvocations.filter((i) => {
      const s = String(i.status || '').toLowerCase().trim();
      return (
        s === 'aktif' ||
        s === 'terlambat' ||
        s === 'menunggu persetujuan' ||
        s === 'menunggu_persetujuan' ||
        s === 'menunggu pelepasan' ||
        s === 'menunggu_pelepasan'
      );
    });
    return actives.length;
  }, [userInvocations]);

  const isPengamal = user && user.role !== 'admin';

  // Category filter tabs
  const categoryTabNames = useMemo(() => {
    const names = categories.map((c) => c.nama).filter(Boolean);
    return ['Semua', ...Array.from(new Set(names))];
  }, [categories]);

  // Filtered khodams
  const filteredKhodams = useMemo(() => {
    return khodams.filter((k) => {
      // 1. Category filter
      if (selectedCategory !== 'Semua') {
        const matchCat = (k.kategoris || []).some(
          (c) => c.nama.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!matchCat) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = k.nama.toLowerCase().includes(query);
        const matchAsal = k.asal.toLowerCase().includes(query);
        const matchCode = k.kode_khodam.toLowerCase().includes(query);
        const matchCat = (k.kategoris || []).some((c) =>
          c.nama.toLowerCase().includes(query)
        );
        if (!matchName && !matchAsal && !matchCode && !matchCat) return false;
      }

      return true;
    });
  }, [khodams, selectedCategory, searchQuery]);

  // Sliced or full items depending on showAll
  const displayedKhodams = useMemo(() => {
    if (showAll || selectedCategory !== 'Semua' || searchQuery.trim() !== '') {
      return filteredKhodams;
    }
    return filteredKhodams.slice(0, 4);
  }, [filteredKhodams, showAll, selectedCategory, searchQuery]);

  return (
    <section id="katalog" className="py-20 lg:py-28 bg-[#090807]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
                Katalog Padepokan Live
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Temukan pendamping gaib yang selaras.
            </h2>
            <p className="mt-3 text-sm text-stone-400 max-w-2xl leading-relaxed">
              Dari penjagaan santet tanah hingga penarik rezeki halal. Setiap khodam terdaftar resmi dalam catatan padepokan dengan asal dan energi berbeda.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-end">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>{showAll ? 'Tampilkan 4 utama' : `Lihat semua khodam (${filteredKhodams.length})`}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <Link
              href="/katalog"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
            >
              <span>Katalog Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Category Filter Tabs & Quick Search */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-stone-800/80 pb-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categoryTabNames.map((catName) => {
              const isActive = selectedCategory === catName;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => setSelectedCategory(catName)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 font-bold text-stone-950 shadow-md shadow-amber-950/40'
                      : 'border border-stone-800 bg-[#12100e] text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari khodam, asal, kode..."
              className="w-full rounded-lg border border-stone-800 bg-[#12100e] pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-500 hover:text-stone-300"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Khodams Cards Grid */}
        <div id="katalog-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedKhodams.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-800 bg-[#12100e]/50 py-16 text-center">
              <p className="text-sm text-stone-400">Tidak ada khodam yang sesuai dengan pencarian atau filter kategori ini.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Semua');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs font-semibold text-amber-400 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            displayedKhodams.map((khodam) => {
              const sigilParts = (khodam.kode_khodam || 'KHD-000-001').split('-');
              const sigil = sigilParts[1] || 'KHD';
              const subnum = sigilParts[2] || '';
              const isAvailable = khodam.status === 'Menunggu Dipanggil' && khodam.is_tersedia !== false;

              return (
                <div
                  key={khodam.id}
                  onClick={() => setSelectedKhodam(khodam)}
                  className="group relative cursor-pointer flex flex-col justify-between rounded-xl border border-stone-800/80 bg-[#12100e] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-stone-700 hover:shadow-xl hover:shadow-black/50"
                >
                  {/* Top sigil circular badge */}
                  <div className="flex items-center justify-center pt-2 pb-6">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-stone-800 bg-stone-900/60 shadow-inner group-hover:border-amber-500/40 transition-colors">
                      {/* Concentric subtle circles */}
                      <div className="absolute inset-1.5 rounded-full border border-dashed border-stone-800/80 group-hover:border-amber-500/20" />
                      <div className="text-center z-10">
                        <span className="font-mono text-sm font-bold tracking-widest text-stone-300 group-hover:text-amber-300 transition-colors block">
                          {sigil}
                        </span>
                        {subnum && (
                          <span className="font-mono text-[9px] text-stone-500 block">
                            {subnum}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                        {khodam.nama}
                      </h3>

                      {/* Signal strength indicator bars (1 to 5) */}
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
                      Asal: {khodam.asal}
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-500 truncate">
                      {(khodam.kategoris || []).map((k) => k.nama).join(', ') || 'Umum'}
                    </p>
                  </div>

                  {/* Bottom Row: Status + Direct Actions */}
                  <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-xs gap-2">
                    {/* Status Badge */}
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/60 px-2 py-0.5 text-[11px] font-medium text-stone-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Tersedia</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-900/40 bg-amber-950/20 px-2 py-0.5 text-[11px] font-medium text-amber-300/90">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>Bersemayam</span>
                      </span>
                    )}

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2">
                      {isPengamal && isAvailable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRitualKhodam(khodam);
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-[#d8b168] hover:bg-[#c99f52] px-2.5 py-1 text-[11px] font-bold text-stone-950 transition-colors shadow-sm cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Panggil</span>
                        </button>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-amber-300 transition-colors">
                        <span>Detail</span>
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dynamic Category Highlights Section below cards */}
        <div className="mt-16 pt-12 border-t border-stone-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Kategori & Tuah Gaib Padepokan
                </h3>
              </div>
              <p className="mt-1 text-xs text-stone-400">
                Klasifikasi energi khodam sesuai hajat spiritual dan pagar gaib yang dibutuhkan.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400/90 self-start sm:self-auto rounded-full bg-amber-950/40 border border-amber-800/40 px-3 py-1">
              {categories.length} Kategori Terdaftar di Database
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => (
              <div
                key={cat.id || idx}
                onClick={() => {
                  setSelectedCategory(cat.nama);
                  document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group/cat cursor-pointer flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  selectedCategory === cat.nama
                    ? 'border-amber-500/60 bg-[#171411] shadow-lg shadow-amber-950/20'
                    : 'border-stone-800/80 bg-[#12100e] hover:border-stone-700 hover:bg-[#151310]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover/cat:text-amber-300 transition-colors">
                      {cat.nama}
                    </h4>
                    <span className="text-[10px] font-mono text-stone-500">
                      KAT-{String(cat.id || idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                    {cat.deskripsi || 'Entitas gaib khusus dengan fokus tuah dan energi selaras.'}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500 group-hover/cat:text-amber-400/90">
                  <span>Lihat khodam kategori ini</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      <KhodamDetailModal
        khodam={selectedKhodam}
        onClose={() => setSelectedKhodam(null)}
        onPanggil={(khodam) => {
          setSelectedKhodam(null);
          setRitualKhodam(khodam);
        }}
      />

      {/* Ritual Pemanggilan Modal directly on Landing Page */}
      <RitualPemanggilanModal
        khodam={ritualKhodam}
        onClose={() => setRitualKhodam(null)}
        currentActiveCount={activeCount}
        onSuccess={() => {
          loadData();
        }}
      />
    </section>
  );
}
