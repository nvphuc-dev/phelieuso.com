'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, TrendingUp, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { getUser } from '@/lib/auth';
import { canAccess } from '@/lib/permissions';
import { User } from '@/types';

const bottomItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/purchases', label: 'Mua vào',   icon: ShoppingCart },
  { href: '/sales',     label: 'Bán ra',    icon: TrendingUp },
  { href: '/reports',   label: 'Báo cáo',   icon: BarChart3 },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setUser(getUser()); }, []);

  const visible = bottomItems.filter(({ href }) => canAccess(user, href));
  if (visible.length === 0) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,.06)] md:hidden print:hidden safe-area-pb">
      <div className="flex items-stretch h-16">
        {visible.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                active ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              <Icon
                size={22}
                className={clsx('transition-transform', active && 'scale-110')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
