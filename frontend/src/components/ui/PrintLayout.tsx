'use client';

/**
 * Bọc nội dung cần in.
 * Khi in, chỉ vùng này được hiển thị — phần còn lại (sidebar, topbar, nút...) bị ẩn.
 */
export default function PrintLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="print-area">
      {/* Header chỉ hiển thị khi in */}
      {(title || subtitle) && (
        <div className="print-header hidden print:block text-center mb-4">
          {title && <h1 className="text-xl font-bold">{title}</h1>}
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
