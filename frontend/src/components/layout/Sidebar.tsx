'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Package, ShoppingCart,
  TrendingUp, BarChart3, Boxes, UserCog, Gift, UserCircle, X, LogOut, BookOpen,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getUser, clearAuth } from '@/lib/auth';
import { authService } from '@/services/auth.service';
import { canAccess } from '@/lib/permissions';
import { User } from '@/types';

const navItems = [
  { href: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/customers',       label: 'Khách hàng',      icon: Users },
  { href: '/materials',       label: 'Vật liệu',        icon: Package },
  { href: '/purchases',       label: 'Mua vào',         icon: ShoppingCart },
  { href: '/sales',           label: 'Bán ra',          icon: TrendingUp },
  { href: '/inventory',       label: 'Tồn kho',         icon: Boxes },
  { href: '/reports',         label: 'Báo cáo',         icon: BarChart3 },
  { href: '/customers/bonus', label: 'Thưởng cuối năm', icon: Gift },
  { href: '/guide',           label: 'Hướng dẫn',       icon: BookOpen },
];

const adminItems = [
  { href: '/users', label: 'Nhân viên', icon: UserCog },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    clearAuth();
    onClose();
    router.push('/login');
  };

  const visibleNav   = navItems.filter(({ href }) => canAccess(user, href));
  const visibleAdmin = adminItems.filter(({ href }) => canAccess(user, href));

  const isEmployee     = user?.role === 'employee';
  const ownProfileHref = user ? `/users/${user.id}` : null;

  const roleLabel: Record<string, string> = {
    owner: 'Chủ kho', manager: 'Quản lý', employee: 'Nhân viên',
  };
  const roleBadge: Record<string, string> = {
    owner: 'bg-purple-500/20 text-purple-300',
    manager: 'bg-blue-500/20 text-blue-300',
    employee: 'bg-gray-500/20 text-gray-400',
  };

  const linkClass = (href: string, exact = false) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      (exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/')))
        ? 'bg-emerald-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    );

  return (
    <aside
      className={clsx(
        // Base
        'flex flex-col w-64 bg-gray-900 text-white shrink-0',
        // Mobile: fixed overlay, slide in from left
        'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: always visible, part of flex flow
        'md:relative md:translate-x-0 md:inset-auto md:z-auto',
        // Print
        'print:hidden',
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-emerald-400">♻ RWM</h1>
          <p className="text-xs text-gray-300 mt-0.5">Quản Lý Kho Ve Chai</p>
          {user && (
            <span className={clsx('inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium', roleBadge[user.role])}>
              {roleLabel[user.role] ?? user.role}
            </span>
          )}
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white"
          aria-label="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* Employee: profile only */}
        {isEmployee && ownProfileHref && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tài khoản</p>
            </div>
            <Link href={ownProfileHref} onClick={onClose} className={linkClass(ownProfileHref)}>
              <UserCircle size={18} />
              Hồ sơ của tôi
            </Link>
          </>
        )}

        {/* Owner / Manager: admin section */}
        {visibleAdmin.length > 0 && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quản trị</p>
            </div>
            {visibleAdmin.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={onClose} className={linkClass(href)}>
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout — bottom of sidebar, mobile only */}
      <div className="md:hidden px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
