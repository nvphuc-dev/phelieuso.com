'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUser } from '@/lib/auth';
import { canAccess, defaultHomePath } from '@/lib/permissions';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileBottomNav from './MobileBottomNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) { router.push('/login'); return; }
    const user = getUser();
    if (user && !canAccess(user, pathname)) router.replace(defaultHomePath(user.role));
  }, [router, pathname]);

  // Đóng sidebar mỗi khi đổi trang
  useEffect(() => { closeSidebar(); }, [pathname, closeSidebar]);

  if (!mounted) return null;
  if (!isAuthenticated()) return null;
  const user = getUser();
  if (user && !canAccess(user, pathname)) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuOpen={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
