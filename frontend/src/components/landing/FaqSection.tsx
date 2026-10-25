'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0); // First item open by default

  const faqs = [
    {
      question: 'Bagaimana kalau saya terlambat melepas?',
      answer:
        'Sistem akan otomatis menghitung denda mahar keterlambatan sebesar Rp5.000 per hari setelah tanggal jatuh tempo. Perhitungan transparan dan tercatat langsung di Buku Catatan Gaib saat pelepasan.',
    },
    {
      question: 'Apakah saya bisa memanggil sendiri?',
      answer:
        'Seluruh proses pemanggilan dan pelepasan khodam dikendalikan secara aman dan terverifikasi langsung oleh Juru Kunci demi menjaga kestabilan energi serta keselamatan spiritual pengamal.',
    },
    {
      question: 'Bagaimana cara mendapatkan akun?',
      answer:
        'Pengamal dapat mendaftar akun secara mandiri melalui form registrasi. Untuk akun Juru Kunci (Admin), hak akses hanya dapat dibuat oleh administrator yang berwenang.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#090807] border-t border-stone-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Heading */}
          <div className="lg:col-span-5">
            <p className="text-[11px] font-semibold tracking-wider text-amber-400 uppercase">
              Tanya Jawab
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Sebelum memanggil.
            </h2>
          </div>

          {/* Right Column: Accordion */}
          <div className="lg:col-span-7 divide-y divide-stone-800">
            {faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between text-left text-base font-semibold text-white transition-colors hover:text-amber-200"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <span className="ml-4 shrink-0 text-stone-400">
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-amber-400" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="mt-3 pr-8 text-sm text-stone-400 leading-relaxed animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
