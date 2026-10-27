'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, LayoutDashboard, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, getStorageUrl } from '@/lib/utils';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const userAvatarUrl = getStorageUrl(user?.profile?.foto_url || user?.profile?.foto);
  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-800/80 bg-[#090807]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-amber-300">
            KhodamKu
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 group-hover:animate-ping" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#cara-kerja"
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-100"
          >
            Cara Kerja
          </Link>
          <Link
            href="#katalog"
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-100"
          >
            Katalog
          </Link>
          <Link
            href="#aturan"
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-100"
          >
            Aturan
          </Link>
          <Link
            href="#faq"
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-100"
          >
            Tanya Jawab
          </Link>
        </nav>

        {/* Right CTA / User Recognized State */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative flex items-center gap-2" ref={dropdownRef}>
              {/* User Name Pill / Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-stone-800 bg-[#12100e] py-1 pl-1.5 pr-3 text-xs text-stone-200 transition-colors hover:border-stone-700 hover:bg-stone-900"
                aria-expanded={userDropdownOpen}
              >
                <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d8b168]/20 text-[10px] font-bold text-[#d8b168] overflow-hidden">
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span className={userAvatarUrl ? 'hidden' : ''}>{getInitials(user.name)}</span>
                </span>
                <span className="max-w-[130px] truncate font-medium text-white">{user.name}</span>
                <ChevronDown className={`h-3 w-3 text-stone-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Direct Dashboard Link */}
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d8b168]/60 bg-[#d8b168] px-3.5 py-1.5 text-xs font-semibold text-stone-950 transition-all hover:bg-[#c99f52] shadow-sm active:scale-[0.98]"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* Mystical Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-stone-800 bg-[#12100e] p-1.5 shadow-2xl backdrop-blur-md">
                  <div className="border-b border-stone-800/80 px-3 py-2.5">
                    <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-stone-400 truncate mt-0.5">{user.email}</p>
                    <span className="mt-1.5 inline-block rounded border border-amber-500/30 bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300">
                      {user.role === 'admin' ? 'Juru Kunci' : 'Pengamal'}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      href={dashboardHref}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-200 transition-colors hover:bg-stone-800/70 hover:text-amber-300"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-stone-400" />
                      <span>Masuk ke Dashboard</span>
                    </Link>

                    {user.role !== 'admin' && (
                      <Link
                        href="/profil"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-stone-200 transition-colors hover:bg-stone-800/70 hover:text-white"
                      >
                        <User className="h-3.5 w-3.5 text-stone-400" />
                        <span>Profil Saya</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-stone-800/80 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/30 hover:text-red-300"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-stone-700/80 bg-stone-900/80 px-4 py-1.5 text-xs font-medium text-stone-200 transition-all hover:border-amber-500/50 hover:bg-stone-800 hover:text-white"
            >
              Masuk
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-stone-800 bg-[#0c0a09] px-4 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="#cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-300 hover:text-amber-400"
            >
              Cara Kerja
            </Link>
            <Link
              href="#katalog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-300 hover:text-amber-400"
            >
              Katalog
            </Link>
            <Link
              href="#aturan"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-300 hover:text-amber-400"
            >
              Aturan
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-stone-300 hover:text-amber-400"
            >
              Tanya Jawab
            </Link>

            {user ? (
              <div className="pt-3 border-t border-stone-800/80 flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 px-1 py-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d8b168]/20 font-bold text-[#d8b168] text-xs">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-[11px] text-stone-400">{user.role === 'admin' ? 'Juru Kunci' : 'Pengamal'}</p>
                  </div>
                </div>

                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#d8b168] px-4 py-2.5 text-center text-sm font-semibold text-stone-950 hover:bg-[#c99f52]"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Masuk ke Dashboard</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg border border-stone-800 bg-stone-900/60 px-4 py-2 text-center text-xs font-medium text-red-400 hover:bg-stone-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-stone-800/80">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg border border-amber-600/50 bg-stone-900 px-4 py-2 text-center text-sm font-medium text-amber-200 hover:bg-stone-800"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
