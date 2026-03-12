'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { purchaseService } from '@/services/purchase.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { ArrowLeft, Printer, XCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

function fmtWeight(n: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(n);
}

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: purchase, isLoading, isError } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.getById(Number(id)),
  });

  const cancelMutation = useMutation({
    mutationFn: () => purchaseService.cancel(Number(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['purchase', id] });
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

  if (isError || !purchase) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Không tìm thấy đơn mua này.</p>
        <Link href="/purchases"><Button variant="secondary" className="mt-4">Quay lại</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/purchases"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
          <h1 className="text-2xl font-bold text-gray-900">Đơn mua #{purchase.id}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${purchase.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {purchase.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
          </span>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer size={15} /> In
          </Button>
          {purchase.status === 'completed' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              <XCircle size={15} /> Huỷ đơn
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Huỷ đơn mua?"
        message={`Đơn mua #${purchase.id} sẽ bị huỷ và tồn kho sẽ được hoàn lại. Hành động này không thể khôi phục.`}
        confirmLabel="Huỷ đơn"
        cancelLabel="Không, giữ lại"
        loading={cancelMutation.isPending}
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Người bán</span>
              <span className="font-medium">{purchase.customer?.name}</span>
            </div>
            {purchase.customer?.phone && (
              <div className="flex justify-between">
                <span className="text-gray-500">SĐT</span>
                <span>{purchase.customer.phone}</span>
              </div>
            )}
            {purchase.customer?.address && (
              <div className="flex justify-between">
                <span className="text-gray-500">Địa chỉ</span>
                <span>{purchase.customer.address}</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Ngày & Giờ</span>
              <span className="font-medium">
                {purchase.date}
                {purchase.time && (
                  <span className="ml-2 text-emerald-600 font-semibold">{purchase.time.slice(0, 5)}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Người tạo</span>
              <span>{purchase.created_by?.name}</span>
            </div>
            {purchase.note && (
              <div className="flex justify-between">
                <span className="text-gray-500">Ghi chú</span>
                <span className="text-right max-w-xs">{purchase.note}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Chi tiết hàng hoá">
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
            {purchase.items?.map((item) => (
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
              <td className="pt-3 text-right text-xl font-bold text-emerald-600">{fmt(purchase.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}
