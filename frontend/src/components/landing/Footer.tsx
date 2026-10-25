import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-stone-800/80 bg-[#090807] py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        {/* Brand & Tagline */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              KhodamKu
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Sewa khodam, hidup lebih tenang.
          </p>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400">
            <Link
              href="#cara-kerja"
              className="hover:text-stone-200 transition-colors"
            >
              Dokumentasi
            </Link>
            <span className="text-stone-700">|</span>
            <Link
              href="/login"
              className="hover:text-stone-200 transition-colors"
            >
              Riwayat Transaksi
            </Link>
            <span className="text-stone-700">|</span>
            <Link
              href="/login"
              className="hover:text-stone-200 transition-colors"
            >
              Masuk
            </Link>
          </div>
          <p className="text-[11px] text-stone-600">
            &copy; 2026 KhodamKu. Hak cipta dilindungi undang-undang gaib.
          </p>
        </div>
      </div>
    </footer>
  );
}
