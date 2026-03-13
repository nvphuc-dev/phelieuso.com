'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { salesService } from '@/services/sales.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { Plus, Eye, XCircle } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function SalesPage() {
  const qc = useQueryClient();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales', from, to],
    queryFn: () => salesService.getAll({ from: from || undefined, to: to || undefined }),
  });

  const cancelMutation = useMutation({
    mutationFn: salesService.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sales'] });
      setConfirmId(null);
    },
  });

  const confirmingOrder = (data?.data ?? []).find((s) => s.id === confirmId);
  const orders = data?.data ?? [];

  return (
    <div className="space-y-4">
      <ConfirmModal
        open={confirmId !== null}
        title="Huỷ đơn bán?"
        message={
          confirmingOrder
            ? `Đơn bán #${confirmingOrder.id} của ${confirmingOrder.customer?.name ?? '?'} sẽ bị huỷ và tồn kho sẽ được cộng lại. Hành động này không thể khôi phục.`
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Đơn bán ra</h1>
        <Link href="/sales/new">
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
          <p className="text-sm text-gray-500 py-4 text-center">Chưa có đơn bán nào.</p>
        ) : (
          <>
            {/* ── Desktop table ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2 pr-4">#</th>
                    <th className="text-left py-2 pr-4">Ngày &amp; Giờ</th>
                    <th className="text-left py-2 pr-4">Người mua</th>
                    <th className="text-right py-2 pr-4">Tổng tiền</th>
                    <th className="text-left py-2 pr-4">Trạng thái</th>
                    <th className="text-right py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 text-gray-400">#{s.id}</td>
                      <td className="py-2.5 pr-4">
                        <span>{s.date}</span>
                        {s.time && (
                          <span className="ml-1.5 text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                            {s.time.slice(0, 5)}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 font-medium">{s.customer?.name}</td>
                      <td className="py-2.5 pr-4 text-right font-semibold">{fmt(s.total_amount)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {s.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/sales/${s.id}`}>
                            <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                          </Link>
                          {s.status === 'completed' && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                              onClick={() => setConfirmId(s.id)}>
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
              {orders.map((s) => (
                <div key={s.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 truncate">{s.customer?.name}</span>
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{s.date}</span>
                      {s.time && (
                        <span className="font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                          {s.time.slice(0, 5)}
                        </span>
                      )}
                      <span>#{s.id}</span>
                    </div>
                    <p className="mt-1.5 text-base font-bold text-gray-900">{fmt(s.total_amount)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Link href={`/sales/${s.id}`}>
                      <Button variant="ghost" size="sm"><Eye size={16} /></Button>
                    </Link>
                    {s.status === 'completed' && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                        onClick={() => setConfirmId(s.id)}>
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
