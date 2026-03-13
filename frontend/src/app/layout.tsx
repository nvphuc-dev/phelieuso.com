import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/lib/query-client';

const openSans = Open_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  // ── Cơ bản ──────────────────────────────────────────
  title: 'RWM - Quản Lý Kho Ve Chai',
  description: 'Phần mềm quản lý kho ve chai: mua vào, bán ra, tồn kho, báo cáo doanh thu và thưởng cuối năm.',
  keywords: ['quản lý kho', 've chai', 'phế liệu', 'mua vào', 'bán ra', 'tồn kho', 'báo cáo'],

  // ── Open Graph (Facebook / Zalo / Messenger) ────────
  openGraph: {
    title: 'RWM - Quản Lý Kho Ve Chai',
    description: 'Phần mềm quản lý kho ve chai: mua vào, bán ra, tồn kho, báo cáo doanh thu.',
    url: 'https://rwm.example.com',      // ← đổi thành domain thật
    siteName: 'RWM',
    locale: 'vi_VN',
    type: 'website',
    // images: [{ url: 'https://rwm.example.com/og-image.png', width: 1200, height: 630 }],
  },

  // ── Twitter Card ────────────────────────────────────
  twitter: {
    card: 'summary',
    title: 'RWM - Quản Lý Kho Ve Chai',
    description: 'Phần mềm quản lý kho ve chai: mua vào, bán ra, tồn kho, báo cáo doanh thu.',
    // images: ['https://rwm.example.com/og-image.png'],
  },

  // ── Robots / Indexing ───────────────────────────────
  robots: {
    index: false,       // đây là app nội bộ → không index
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={openSans.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
