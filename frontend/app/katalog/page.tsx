'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpRight, Sparkles, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import HeaderDate from '@/components/layout/HeaderDate';
import KhodamDetailModal from '@/components/landing/KhodamDetailModal';
import RitualPemanggilanModal from '@/components/features/RitualPemanggilanModal';
import { Khodam } from '@/types';
import { MASTER_KHODAMS } from '@/lib/khodamData';
import { useAuth } from '@/hooks/useAuth';

const DEFAULT_CATEGORIES = [
  'Semua',
  'Penjaga Rumah',
  'Penglaris Dagangan',
  'Pelindung Ujian',
  'Kewibawaan',
  'Penolak Bala',
  'Pencari Jodoh',
];

export default function KatalogPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedKhodam, setSelectedKhodam] = useState<Khodam | null>(null);
  const [ritualKhodam, setRitualKhodam] = useState<Khodam | null>(null);
  const [userInvocations, setUserInvocations] = useState<any[]>([]);
  const [dynamicKhodams, setDynamicKhodams] = useState<Khodam[]>(MASTER_KHODAMS);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load user invocations to compute active slot quota, dynamic khodams, and categories
  const loadData = async () => {
    try {
      const [resPemanggilan, resKhodams, resCategories] = await Promise.all([
        fetch('/api/pemanggilan'),
        fetch('/api/khodams'),
        fetch('/api/kategori'),
      ]);

      if (resPemanggilan.ok) {
        const json = await resPemanggilan.json();
        if (json.data && Array.isArray(json.data)) {
          setUserInvocations(json.data);
        }
      }

      let loadedKhodams: Khodam[] = [];
      if (resKhodams.ok) {
        const jsonK = await resKhodams.json();
        if (jsonK.data && Array.isArray(jsonK.data)) {
          setDynamicKhodams(jsonK.data);
          loadedKhodams = jsonK.data;
        }
      }

      if (resCategories.ok) {
        const jsonC = await resCategories.json();
        if (jsonC.data && Array.isArray(jsonC.data)) {
          const names: string[] = jsonC.data.map((c: any) => c.nama).filter(Boolean);
          setCategories(Array.from(new Set(['Semua', ...names])));
        }
      } else if (loadedKhodams.length > 0) {
        const extracted = loadedKhodams.flatMap((k) => k.kategoris.map((c) => c.nama));
        setCategories(Array.from(new Set(['Semua', ...DEFAULT_CATEGORIES.slice(1), ...extracted])));
      }
    } catch (err) {
      console.warn('Could not load catalog data:', err);
    } finally {
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Compute active slots for this logged-in pengamal
  const activeCount = useMemo(() => {
    if (!hasLoaded) {
      const emailLower = user?.email?.toLowerCase() || '';
      if (emailLower.includes('bima')) return 2;
      if (emailLower.includes('sekar')) return 1;
      if (emailLower.includes('raka') || emailLower.includes('pengamal@khodamku.test')) return 1;
      return 0;
    }
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
  }, [userInvocations, user, hasLoaded]);

  // Dynamic Filtering Logic
  const filteredKhodams = useMemo(() => {
    return dynamicKhodams.filter((k) => {
      // 1. Availability filter
      if (onlyAvailable && k.status !== 'Menunggu Dipanggil') {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'Semua') {
        const hasCategory = k.kategoris.some(
          (cat) => cat.nama.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (!hasCategory) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = k.nama.toLowerCase().includes(q);
        const matchCode = k.kode_khodam.toLowerCase().includes(q);
        const matchAsal = k.asal.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchAsal) return false;
      }

      return true;
    });
  }, [dynamicKhodams, searchQuery, selectedCategory, onlyAvailable]);

  const availableCount = dynamicKhodams.filter(
    (k) => k.status === 'Menunggu Dipanggil'
  ).length;

  const isPengamal = user && user.role !== 'admin';

  return (
    <div className="min-h-screen bg-[#090807] text-stone-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="border-b border-stone-800/80 px-8 py-4">
          <HeaderDate />
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 max-w-6xl w-full">
          {/* Page Heading & Slot Quota Banner */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#d8b168] uppercase">
                Katalog
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Pilih khodam
              </h1>
              <p className="mt-2 text-sm text-stone-400">
                {availableCount} dari {dynamicKhodams.length} unit sedang menunggu dipanggil. Nama boleh sama — setiap unit dibedakan lewat kodenya.
              </p>
            </div>

            {/* Pengamal Capacity Indicator */}
            {isPengamal && (
              <div className="rounded-xl border border-stone-800 bg-[#12100e] px-4 py-2.5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-[#d8b168]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="text-stone-400">Kapasitas Ragamu:</p>
                  <p className="font-bold text-white">
                    <span className={activeCount >= 2 ? 'text-amber-400' : 'text-emerald-400'}>
                      {activeCount}/2 Slot
                    </span>{' '}
                    <span className="text-stone-400 font-normal">
                      {activeCount >= 2 ? '(Slot Penuh)' : `(${2 - activeCount} slot kosong)`}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar & Availability Toggle Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama khodam, mis. Macan Putih"
                className="w-full rounded-lg border border-stone-800 bg-[#12100e] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-stone-600 focus:border-[#d8b168] focus:outline-none focus:ring-1 focus:ring-[#d8b168] transition-colors"
              />
            </div>

            {/* "Hanya yang tersedia" Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${onlyAvailable ? 'bg-[#d8b168]' : 'bg-stone-800'
                  }`}
                role="switch"
                aria-checked={onlyAvailable}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-stone-300 shadow-md ring-0 transition duration-200 ease-in-out ${onlyAvailable ? 'translate-x-4 bg-stone-950' : 'translate-x-0'
                    }`}
                />
              </button>
              <span
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className="text-xs text-stone-400 cursor-pointer select-none hover:text-stone-300 transition-colors"
              >
                Hanya yang tersedia
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${isActive
                      ? 'bg-white text-stone-950 shadow-sm'
                      : 'border border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 3-Column Grid of 8 Khodam Cards */}
          {filteredKhodams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-800 p-12 text-center">
              <p className="text-sm font-medium text-stone-400">
                Tidak ada khodam yang cocok dengan filter atau kata kunci pencarian.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                  setOnlyAvailable(false);
                }}
                className="mt-3 text-xs text-amber-400 hover:underline"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredKhodams.map((khodam) => {
                const sigil = khodam.kode_khodam.split('-')[1] || 'KHD';
                const subnum = khodam.kode_khodam.split('-')[2] || '001';
                const isBersemayam = khodam.status === 'Sedang Bersemayam';

                return (
                  <div
                    key={khodam.id}
                    onClick={() => setSelectedKhodam(khodam)}
                    className="group cursor-pointer rounded-xl border border-stone-800/80 bg-[#12100e] p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-stone-700 hover:shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Code */}
                      <div className="text-[10px] font-mono text-stone-500 uppercase">
                        {khodam.kode_khodam}
                      </div>

                      {/* Circular Radar / Target Sigil */}
                      <div className="flex items-center justify-center py-7">
                        <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border border-stone-800 bg-stone-900/50 shadow-inner group-hover:border-amber-500/40 transition-colors">
                          {/* Concentric rings & crosshairs */}
                          <div className="absolute inset-1.5 rounded-full border border-stone-800/80" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-full w-[1px] bg-stone-800/40" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-stone-800/40" />
                          </div>

                          <span className="font-mono text-sm font-bold tracking-widest text-stone-200 group-hover:text-amber-300 transition-colors z-10">
                            {sigil}
                          </span>
                          <span className="font-mono text-[9px] text-stone-500 z-10 mt-0.5">
                            {subnum}
                          </span>
                        </div>
                      </div>

                      {/* Identity & Signal */}
                      <div className="pt-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                            {khodam.nama}
                          </h3>

                          {/* Signal Strength bars */}
                          <div className="flex items-end gap-[2px] h-3.5 pt-0.5">
                            {[1, 2, 3, 4, 5].map((lvl) => {
                              const heights = ['h-1', 'h-1.5', 'h-2', 'h-2.5', 'h-3'];
                              const isActive = lvl <= khodam.level_kekuatan;
                              return (
                                <span
                                  key={lvl}
                                  className={`w-[3px] rounded-xs ${heights[lvl - 1]} ${isActive
                                      ? 'bg-amber-400 group-hover:bg-amber-300'
                                      : 'bg-stone-800'
                                    }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <p className="mt-1 text-xs text-stone-400">
                          {khodam.asal}
                        </p>
                        <p className="mt-0.5 text-[11px] text-stone-500 truncate">
                          {khodam.kategoris.map((k) => k.nama).join(' · ')}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                      {isBersemayam ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-900/40 bg-amber-950/20 px-2 py-0.5 text-[11px] font-medium text-amber-200/90">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>Sedang Bersemayam</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/60 px-2 py-0.5 text-[11px] font-medium text-stone-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Menunggu Dipanggil</span>
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {isPengamal && !isBersemayam && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRitualKhodam(khodam);
                            }}
                            className="inline-flex items-center gap-1 rounded-md bg-[#d8b168] hover:bg-[#c99f52] px-2.5 py-1 text-[11px] font-bold text-stone-950 transition-colors shadow-sm"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Panggil</span>
                          </button>
                        )}

                        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-stone-400 group-hover:text-amber-300 transition-colors">
                          <span>Detail</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
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

      {/* Ritual Pemanggilan Modal */}
      <RitualPemanggilanModal
        khodam={ritualKhodam}
        onClose={() => setRitualKhodam(null)}
        currentActiveCount={activeCount}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
