'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { canAccess, defaultHomePath } from '@/lib/permissions';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    if (user && !canAccess(user, pathname)) {
      router.replace(defaultHomePath(user.role));
    }
  }, [router, pathname]);

  if (!mounted) return null;
  if (!isAuthenticated()) return null;

  const user = getUser();
  if (user && !canAccess(user, pathname)) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
