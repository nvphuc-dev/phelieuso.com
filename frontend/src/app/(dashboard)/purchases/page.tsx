'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { purchaseService } from '@/services/purchase.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Eye, XCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function PurchasesPage() {
  const qc = useQueryClient();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', from, to],
    queryFn: () => purchaseService.getAll({ from: from || undefined, to: to || undefined }),
  });

  const cancelMutation = useMutation({
    mutationFn: purchaseService.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchases'] });
      setConfirmId(null);
    },
  });

  const confirmingOrder = (data?.data ?? []).find((p) => p.id === confirmId);
  const orders = data?.data ?? [];

  return (
    <div className="space-y-4">
      <ConfirmModal
        open={confirmId !== null}
        title="Huỷ đơn mua?"
        message={
          confirmingOrder
            ? `Đơn mua #${confirmingOrder.id} của ${confirmingOrder.customer?.name ?? '?'} sẽ bị huỷ và tồn kho sẽ được hoàn lại. Hành động này không thể khôi phục.`
            : ''
        }
        confirmLabel="Huỷ đơn"
        cancelLabel="Không, giữ lại"
        loading={cancelMutation.isPending}
        onConfirm={() => confirmId !== null && cancelMutation.mutate(confirmId)}
        onCancel={() => setConfirmId(null)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Đơn mua vào</h1>
        <Link href="/purchases/new">
          <Button size="sm"><Plus size={16} className="shrink-0" /> Tạo đơn</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[130px]">
          <Input label="Từ ngày" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[130px]">
          <Input label="Đến ngày" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="w-full md:w-auto">
          <Button variant="secondary" size="md" className="w-full md:w-auto" onClick={() => { setFrom(''); setTo(''); }}>Xoá lọc</Button>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-sm text-gray-500 py-4 text-center">Đang tải...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">Chưa có đơn mua nào.</p>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Ngày &amp; Giờ</th>
                    <th className="text-left py-2 pr-4">Người bán</th>
                    <th className="text-right py-2 pr-4">Tổng tiền</th>
                    <th className="text-left py-2 pr-4">Trạng thái</th>
                    <th className="text-right py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 text-gray-400">#{p.id}</td>
                      <td className="py-2.5 pr-4">
                        <span>{p.date}</span>
                        {p.time && (
                          <span className="ml-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {p.time.slice(0, 5)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 font-medium">{p.customer?.name}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold">{fmt(p.total_amount)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/purchases/${p.id}`}>
                            <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                          </Link>
                          {p.status === 'completed' && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                              onClick={() => setConfirmId(p.id)}>
                              <XCircle size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile card list ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map((p) => (
                <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{p.customer?.name}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{p.date}</span>
                      {p.time && (
                        <span className="font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {p.time.slice(0, 5)}
                        </span>
                      )}
                      <span>#{p.id}</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold text-gray-900">{fmt(p.total_amount)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/purchases/${p.id}`}>
                      <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                    </Link>
                    {p.status === 'completed' && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                        onClick={() => setConfirmId(p.id)}>
                        <XCircle size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {data?.meta && (
          <p className="text-xs text-gray-400 mt-3">Tổng: {data.meta.total} đơn</p>
        )}
      </Card>
    </div>
  );
}
