'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Khodam } from '@/types';
import KhodamDetailModal from './KhodamDetailModal';

// Seeded master catalog data matching the screenshot & database
const INITIAL_KHODAMS: Khodam[] = [
  {
    id: 1,
    kode_khodam: 'KHD-MCP-001',
    nama: 'Macan Putih',
    asal: 'Alas Purwo, Banyuwangi',
    level_kekuatan: 4,
    deskripsi: 'Sosok macan putih sakti penjaga gerbang gaib ujung timur Jawa.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 1, nama: 'Penjaga Rumah' },
      { id: 4, nama: 'Kewibawaan' },
    ],
  },
  {
    id: 2,
    kode_khodam: 'KHD-MCP-002',
    nama: 'Macan Putih',
    asal: 'Gunung Lawu, Karanganyar',
    level_kekuatan: 5,
    deskripsi: 'Siluman macan putih bertuah penunggu kabut mistis puncak Lawu.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 1, nama: 'Penjaga Rumah' },
      { id: 4, nama: 'Kewibawaan' },
    ],
  },
  {
    id: 3,
    kode_khodam: 'KHD-HRM-001',
    nama: 'Harimau Sumatra',
    asal: 'Bukit Barisan, Sumatra Barat',
    level_kekuatan: 4,
    deskripsi: 'Aura rimba Sumatra yang kuat untuk proteksi dan wibawa tingkat tinggi.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 4, nama: 'Kewibawaan' },
      { id: 5, nama: 'Penolak Bala' },
    ],
  },
  {
    id: 4,
    kode_khodam: 'KHD-KBJ-001',
    nama: 'Kakek Berjubah Putih',
    asal: 'Pertapaan Kendalisada',
    level_kekuatan: 3,
    deskripsi: 'Sosok sepuh bijak penuntun ketenangan batin dan penangkal marabahaya.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [
      { id: 3, nama: 'Pelindung Ujian' },
      { id: 5, nama: 'Penolak Bala' },
    ],
  },
  {
    id: 5,
    kode_khodam: 'KHD-NGH-001',
    nama: 'Naga Hijau',
    asal: 'Telaga Sarangan, Magetan',
    level_kekuatan: 5,
    deskripsi: 'Naga mistis pembawa aura kemakmuran dan pelaris dagangan.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 2, nama: 'Penglaris Dagangan' }],
  },
  {
    id: 6,
    kode_khodam: 'KHD-KCO-001',
    nama: 'Kucing Oren Barbar',
    asal: 'Gang Kelinci, Jakarta',
    level_kekuatan: 3,
    deskripsi: 'Penjaga rumah yang lincah, berani, dan siap mengusir energi negatif.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 1, nama: 'Penjaga Rumah' }],
  },
  {
    id: 7,
    kode_khodam: 'KHD-KDP-001',
    nama: 'Kulkas Dua Pintu',
    asal: 'Pasar Elektronik Glodok',
    level_kekuatan: 2,
    deskripsi: 'Khodam pendingin emosi dan penglaris perniagaan kuliner.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 2, nama: 'Penglaris Dagangan' }],
  },
  {
    id: 8,
    kode_khodam: 'KHD-TPN-001',
    nama: 'Tutup Panci',
    asal: 'Dapur Bu Sum, Solo',
    level_kekuatan: 1,
    deskripsi: 'Menutup masa lalu dan mempermudah menemukan jodoh yang pas pasangannya.',
    foto: null,
    status: 'Menunggu Dipanggil',
    is_tersedia: true,
    kategoris: [{ id: 6, nama: 'Pencari Jodoh' }],
  },
];

const CATEGORIES_INFO = [
  {
    title: 'Penjaga Rumah',
    desc: 'Menjaga dari pagar gaib dan santet tanah.',
  },
  {
    title: 'Penglaris Dagangan',
    desc: 'Membantu kelancaran transaksi & rezeki halal.',
  },
  {
    title: 'Pelindung Ujian',
    desc: 'Membantu ketenangan batin, kejernihan pikiran, dan fokus belajar.',
  },
  {
    title: 'Kewibawaan',
    desc: 'Mengangkat pamor dan daya pikat persona.',
  },
  {
    title: 'Penolak Bala',
    desc: 'Menangkal teluh, santet, dan marabahaya gaib.',
  },
  {
    title: 'Pencari Jodoh',
    desc: 'Membuka pancaran aura asmara dan jodoh sejati.',
  },
];

export default function KatalogSection() {
  const [showAll, setShowAll] = useState(false);
  const [selectedKhodam, setSelectedKhodam] = useState<Khodam | null>(null);

  const displayedKhodams = showAll ? INITIAL_KHODAMS : INITIAL_KHODAMS.slice(0, 4);

  return (
    <section id="katalog" className="py-20 lg:py-28 bg-[#090807]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
              Katalog
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Temukan pendamping yang cocok untukmu.
            </h2>
            <p className="mt-3 text-sm text-stone-400 max-w-2xl leading-relaxed">
              Dari penjagaan santet sampai penarik rezeki, setiap khodam punya energi, asal, dan klan berbeda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors whitespace-nowrap self-start md:self-end"
          >
            <span>{showAll ? 'Tampilkan 4 utama' : 'Lihat semua khodam'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid matching screenshot */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedKhodams.map((khodam) => {
            const sigil = khodam.kode_khodam.split('-')[1] || 'KHD';
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
                    <span className="font-mono text-sm font-bold tracking-widest text-stone-300 group-hover:text-amber-300 transition-colors">
                      {sigil}
                    </span>
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
                    {khodam.kategoris.map((k) => k.nama).join(', ')}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-stone-800 bg-stone-900/60 px-2 py-0.5 text-[11px] font-medium text-stone-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{khodam.status}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 group-hover:text-amber-300 transition-colors">
                    <span>Detail</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Highlights Grid below cards */}
        <div className="mt-16 pt-12 border-t border-stone-800/80">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES_INFO.map((cat, idx) => (
              <div key={idx} className="flex flex-col">
                <h4 className="text-sm font-semibold text-white">
                  {cat.title}
                </h4>
                <p className="mt-1 text-xs text-stone-400 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Modal */}
      <KhodamDetailModal
        khodam={selectedKhodam}
        onClose={() => setSelectedKhodam(null)}
      />
    </section>
  );
}
