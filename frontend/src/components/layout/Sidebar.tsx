'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Hourglass,
  BookOpen,
  User as UserIcon,
  LogOut,
  Clock,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin' || pathname.startsWith('/admin');

  const userName = isAdmin
    ? user?.name || 'Mbah Darmo'
    : user?.name || 'Pengamal';
  const userRole = isAdmin ? 'Juru Kunci' : 'Pengamal';
  const initials = getInitials(userName);

  // Pengamal Navigation Menu
  const pengamalNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Katalog Khodam', href: '/katalog', icon: Search },
    { name: 'Pemanggilan Saya', href: '/pemanggilan', icon: Hourglass },
    { name: 'Riwayat Saya', href: '/riwayat', icon: BookOpen },
  ];

  // Admin / Juru Kunci Navigation Menu
  const adminOperasional = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    {
      name: 'Pemanggilan Aktif',
      href: '/admin/pemanggilan',
      icon: Clock,
      badge: '1',
    },
    {
      name: 'Buku Catatan Gaib',
      href: '/admin/buku-catatan-gaib',
      icon: BookOpen,
    },
    { name: 'Katalog', href: '/admin/katalog', icon: Search },
  ];

  const adminKelolaData = [
    { name: 'Khodam', href: '/admin/kelola/khodam', icon: Sparkles },
    { name: 'Kategori', href: '/admin/kelola/kategori', icon: Tag },
    { name: 'Kelola Pengguna', href: '/admin/users', icon: Users },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-stone-800/80 bg-[#090807] p-5">
      {/* Top: Logo & Nav */}
      <div className="overflow-y-auto">
        {/* Brand */}
        <Link href="/" className="inline-block group mb-8">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
            KhodamKu
          </span>
          <div className="h-[2px] w-8 bg-[#d8b168] mt-1 group-hover:w-12 transition-all duration-300" />
        </Link>

        {/* Menu Navigation according to Role */}
        {isAdmin ? (
          <div className="space-y-6">
            {/* Operasional */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-2">
                Operasional
              </p>
              <nav className="space-y-1">
                {adminOperasional.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.name === 'Katalog' &&
                      (pathname === '/admin/katalog' ||
                        pathname === '/admin/khodam'));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-stone-900/90 text-white border border-stone-800/80'
                          : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 text-stone-400" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-950/80 border border-red-900/60 text-[9px] font-bold text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Kelola Data */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-2">
                Kelola Data
              </p>
              <nav className="space-y-1">
                {adminKelolaData.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === '/admin/kelola/khodam' && pathname === '/admin/khodam') ||
                    (item.href === '/admin/users' && pathname === '/admin/kelola/pengamal');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-stone-900/90 text-white border border-stone-800/80'
                          : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-stone-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Akun */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-2">
                Akun
              </p>
              <nav className="space-y-1">
                <Link
                  href="/profil"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    pathname === '/profil' || pathname === '/admin/profil'
                      ? 'bg-stone-900/90 text-white border border-stone-800/80'
                      : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                  }`}
                >
                  <UserIcon className="h-4 w-4 shrink-0 text-stone-400" />
                  <span>Profil</span>
                </Link>
              </nav>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pengamal Menu */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-2">
                Menu
              </p>
              <nav className="space-y-1">
                {pengamalNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-stone-900/90 text-white border border-stone-800/80'
                          : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-stone-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Akun */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-stone-500 mb-2">
                Akun
              </p>
              <nav className="space-y-1">
                <Link
                  href="/profil"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    pathname === '/profil'
                      ? 'bg-stone-900/90 text-white border border-stone-800/80'
                      : 'text-stone-400 hover:bg-stone-900/50 hover:text-stone-200'
                  }`}
                >
                  <UserIcon className="h-4 w-4 shrink-0 text-stone-400" />
                  <span>Profil</span>
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile Card */}
      <div className="rounded-xl border border-stone-800/80 bg-[#12100e] p-3 flex items-center justify-between mt-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-stone-900 text-xs font-bold text-stone-300">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {userName}
            </p>
            <p className="truncate text-[10px] text-stone-500">
              {userRole}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={logout}
          title="Keluar"
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
