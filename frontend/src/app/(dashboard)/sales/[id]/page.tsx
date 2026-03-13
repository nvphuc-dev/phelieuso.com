'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { salesService } from '@/services/sales.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PrintLayout from '@/components/ui/PrintLayout';
import { ArrowLeft, Printer, XCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}
function fmtWeight(n: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(n);
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5 text-sm border-b border-gray-50 last:border-0">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: sale, isLoading, isError } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => salesService.getById(Number(id)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => salesService.cancel(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      qc.invalidateQueries({ queryKey: ['sale', id] });
      setShowConfirm(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy đơn bán này.</p>
        <Link href="/sales"><Button variant="secondary" className="mt-4">Quay lại</Button></Link>
      </div>
    );
  }

  const statusBadge = (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${sale.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {sale.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
    </span>
  );

  return (
    <div className="space-y-4 max-w-4xl">
      <ConfirmModal
        open={showConfirm}
        title="Huỷ đơn bán?"
        message={`Đơn bán #${sale.id} sẽ bị huỷ và tồn kho sẽ được cộng lại. Hành động này không thể khôi phục.`}
        confirmLabel="Huỷ đơn"
        cancelLabel="Không, giữ lại"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setShowConfirm(false)}
      />

      {/* ── Header ── */}
      <div className="print:hidden">
        {/* Mobile: 2 rows */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/sales"><Button variant="ghost" size="sm" className="shrink-0"><ArrowLeft size={16} /></Button></Link>
          <h1 className="text-lg font-bold text-gray-900 truncate">Đơn bán #{sale.id}</h1>
          {statusBadge}
        </div>
        <div className="flex gap-2 mt-2 md:hidden">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => window.print()}>
            <Printer size={15} /> In
          </Button>
          {sale.status === 'completed' && (
            <Button variant="danger" size="sm" className="flex-1" onClick={() => setShowConfirm(true)}>
              <XCircle size={15} /> Huỷ đơn
            </Button>
          )}
        </div>

        {/* Desktop: single row */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/sales"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
            <h1 className="text-2xl font-bold text-gray-900">Đơn bán #{sale.id}</h1>
            {statusBadge}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer size={15} /> In
            </Button>
            {sale.status === 'completed' && (
              <Button variant="danger" size="sm" onClick={() => setShowConfirm(true)}>
                <XCircle size={15} /> Huỷ đơn
              </Button>
            )}
          </div>
        </div>
      </div>

      <PrintLayout
        title={`ĐƠN BÁN RA #${sale.id}`}
        subtitle={`Ngày: ${sale.date}${sale.time ? ' — ' + sale.time.slice(0, 5) : ''} | Người tạo: ${sale.created_by?.name ?? ''}`}
      >
        {/* ── Info section ── */}
        {/* Mobile: single card */}
        <Card className="md:hidden">
          <div className="space-y-0">
            <InfoRow label="Người mua">{sale.customer?.name}</InfoRow>
            {sale.customer?.phone && <InfoRow label="SĐT">{sale.customer.phone}</InfoRow>}
            {sale.customer?.address && <InfoRow label="Địa chỉ">{sale.customer.address}</InfoRow>}
            <InfoRow label="Ngày & Giờ">
              {sale.date}
              {sale.time && (
                <span className="ml-2 text-orange-600 font-semibold">{sale.time.slice(0, 5)}</span>
              )}
            </InfoRow>
            <InfoRow label="Người tạo">{sale.created_by?.name}</InfoRow>
            {sale.note && <InfoRow label="Ghi chú">{sale.note}</InfoRow>}
          </div>
        </Card>

        {/* Desktop: 2-col grid */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Người mua</span>
                <span className="font-medium">{sale.customer?.name}</span>
              </div>
              {sale.customer?.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">SĐT</span>
                  <span>{sale.customer.phone}</span>
                </div>
              )}
              {sale.customer?.address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Địa chỉ</span>
                  <span className="text-right">{sale.customer.address}</span>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Ngày &amp; Giờ</span>
                <span className="font-medium">
                  {sale.date}
                  {sale.time && (
                    <span className="ml-2 text-orange-600 font-semibold">{sale.time.slice(0, 5)}</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Người tạo</span>
                <span>{sale.created_by?.name}</span>
              </div>
              {sale.note && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Ghi chú</span>
                  <span className="text-right max-w-xs">{sale.note}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Items ── */}
        <Card title="Chi tiết hàng hoá" className="mt-4">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 pr-4">Vật liệu</th>
                  <th className="text-right py-2 pr-4">Cân nặng</th>
                  <th className="text-right py-2 pr-4">Đơn giá</th>
                  <th className="text-right py-2">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 pr-4 font-medium">{item.material?.name}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-600">{fmtWeight(item.weight)} {item.material?.unit}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-600">{fmt(item.price_per_unit)}/{item.material?.unit}</td>
                    <td className="py-2.5 text-right font-semibold">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="pt-3 text-right font-semibold text-gray-700">Tổng cộng</td>
                  <td className="pt-3 text-right text-xl font-bold text-emerald-600">{fmt(sale.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-2">
            {sale.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.material?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmtWeight(item.weight)} {item.material?.unit}
                    <span className="mx-1.5 text-gray-300">×</span>
                    {fmt(item.price_per_unit)}/{item.material?.unit}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm shrink-0 ml-3">{fmt(item.total)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 px-1">
              <span className="font-semibold text-gray-700 text-sm">Tổng cộng</span>
              <span className="text-xl font-bold text-emerald-600">{fmt(sale.total_amount)}</span>
            </div>
          </div>
        </Card>
      </PrintLayout>
    </div>
  );
}
