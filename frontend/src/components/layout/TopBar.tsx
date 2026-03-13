'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogOut, User as UserIcon, X } from 'lucide-react';
import { clearAuth, getUser } from '@/lib/auth';
import { authService } from '@/services/auth.service';
import { User } from '@/types';
import Link from 'next/link';

// Map pathname prefix → page title
const PAGE_TITLES: [string, string][] = [
  ['/dashboard',       'Dashboard'],
  ['/customers/bonus', 'Thưởng cuối năm'],
  ['/customers',       'Khách hàng'],
  ['/materials',       'Vật liệu'],
  ['/purchases/new',   'Tạo đơn mua'],
  ['/purchases',       'Mua vào'],
  ['/sales/new',       'Tạo đơn bán'],
  ['/sales',           'Bán ra'],
  ['/inventory',       'Tồn kho'],
  ['/reports',         'Báo cáo'],
  ['/users',           'Nhân viên'],
];

function getPageTitle(pathname: string): string {
  for (const [prefix, title] of PAGE_TITLES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix)) {
      return title;
    }
  }
  return 'RWM';
}

function UserAvatar({ user }: { user: User | null }) {
  if (!user) return null;
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const colors: Record<string, string> = {
    owner: 'bg-purple-600', manager: 'bg-blue-600', employee: 'bg-emerald-600',
  };

  return (
    <Link href={`/users/${user.id}`}>
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
        />
      ) : (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${colors[user.role] ?? 'bg-gray-500'}`}>
          {initials}
        </div>
      )}
    </Link>
  );
}

interface TopBarProps {
  onMenuOpen: () => void;
  sidebarOpen: boolean;
}

export default function TopBar({ onMenuOpen, sidebarOpen }: TopBarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    router.push('/login');
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 print:hidden">
      {/* ── Mobile layout ── */}
      <div className="flex items-center justify-between w-full md:hidden">
        {/* Left: hamburger */}
        <button
          onClick={onMenuOpen}
          className="p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Center: page title */}
        <span className="font-semibold text-gray-800 text-base tracking-tight">
          {pageTitle}
        </span>

        {/* Right: avatar */}
        <UserAvatar user={user} />
      </div>

      {/* ── Desktop layout ── */}
      <div className="hidden md:flex items-center justify-between w-full">
        <span className="text-sm font-medium text-gray-500">{pageTitle}</span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <UserIcon size={15} className="text-gray-400" />
            <span className="font-medium">{user?.name}</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
              {{ owner: 'Chủ kho', manager: 'Quản lý', employee: 'Nhân viên' }[user?.role ?? ''] ?? user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={15} />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
