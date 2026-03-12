'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Boxes,
  UserCog,
  Gift,
  UserCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getUser } from '@/lib/auth';
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
];

const adminItems = [
  { href: '/users', label: 'Nhân viên', icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const visibleNav   = navItems.filter(({ href }) => canAccess(user, href));
  const visibleAdmin = adminItems.filter(({ href }) => canAccess(user, href));

  const isEmployee = user?.role === 'employee';
  const ownProfileHref = user ? `/users/${user.id}` : null;

  const roleLabel: Record<string, string> = {
    owner: 'Chủ kho', manager: 'Quản lý', employee: 'Nhân viên',
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-emerald-400">♻ RWM</h1>
        <p className="text-xs text-gray-400 mt-0.5">Quản Lý Kho Ve Chai</p>
        {user && (
          <span className={clsx(
            'inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium',
            user.role === 'owner'    && 'bg-purple-500/20 text-purple-300',
            user.role === 'manager'  && 'bg-blue-500/20 text-blue-300',
            user.role === 'employee' && 'bg-gray-500/20 text-gray-400',
          )}>
            {roleLabel[user.role] ?? user.role}
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}

        {/* Nhân viên — chỉ thấy link profile của mình */}
        {isEmployee && ownProfileHref && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài khoản</p>
            </div>
            <Link
              href={ownProfileHref}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(ownProfileHref)
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <UserCircle size={18} />
              Hồ sơ của tôi
            </Link>
          </>
        )}

        {/* Owner / Manager — thấy mục quản trị */}
        {visibleAdmin.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quản trị</p>
            </div>
            {visibleAdmin.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
