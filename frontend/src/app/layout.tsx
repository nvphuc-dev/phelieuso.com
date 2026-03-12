import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/lib/query-client';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RWM - Quản Lý Kho Ve Chai',
  description: 'Recycling Warehouse Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={geist.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
