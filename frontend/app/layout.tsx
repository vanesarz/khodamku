import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KhodamKu — Sewa Khodam, Hidup Lebih Tenang",
  description:
    "Temukan khodam pendamping sesuai kebutuhan spiritualmu. Cepat, aman, terpercaya langsung dikendalikan lewat Juru Kunci. Semua tercatat di Buku Catatan Gaib.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090807] text-stone-100 selection:bg-amber-600/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
