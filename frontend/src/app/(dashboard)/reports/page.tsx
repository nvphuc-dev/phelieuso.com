'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/inventory.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function ReportsPage() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);

  const { data: dashboard } = useQuery({
    queryKey: ['report-dashboard', from, to],
    queryFn: () => reportService.getDashboard({ from, to }),
  });

  const { data: purchaseReport } = useQuery({
    queryKey: ['report-purchases', from, to],
    queryFn: () => reportService.getPurchaseReport({ from, to }),
  });

  const { data: salesReport } = useQuery({
    queryKey: ['report-sales', from, to],
    queryFn: () => reportService.getSalesReport({ from, to }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>

      <div className="flex gap-3 items-end">
        <Input label="Từ ngày" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="Đến ngày" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button variant="secondary" onClick={() => { setFrom(firstDay); setTo(today); }}>Tháng này</Button>
      </div>

      {dashboard && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-500">Tổng mua vào</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{fmt(dashboard.purchases.total)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{dashboard.purchases.count} đơn</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Tổng bán ra</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{fmt(dashboard.sales.total)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{dashboard.sales.count} đơn</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Lợi nhuận ước tính</p>
            <p className={`text-2xl font-bold mt-1 ${dashboard.profit_estimation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmt(dashboard.profit_estimation)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Bán - Mua</p>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <Card title="Mua vào theo ngày">
          {purchaseReport?.data?.length === 0 ? (
            <p className="text-sm text-gray-500">Không có dữ liệu</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-1.5">Ngày</th>
                  <th className="text-right py-1.5">Số đơn</th>
                  <th className="text-right py-1.5">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {purchaseReport?.data?.map((row: { date: string; count: number; total: number }) => (
                  <tr key={row.date}>
                    <td className="py-1.5">{row.date}</td>
                    <td className="py-1.5 text-right text-gray-500">{row.count}</td>
                    <td className="py-1.5 text-right font-medium">{fmt(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card title="Bán ra theo ngày">
          {salesReport?.data?.length === 0 ? (
            <p className="text-sm text-gray-500">Không có dữ liệu</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-1.5">Ngày</th>
                  <th className="text-right py-1.5">Số đơn</th>
                  <th className="text-right py-1.5">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {salesReport?.data?.map((row: { date: string; count: number; total: number }) => (
                  <tr key={row.date}>
                    <td className="py-1.5">{row.date}</td>
                    <td className="py-1.5 text-right text-gray-500">{row.count}</td>
                    <td className="py-1.5 text-right font-medium">{fmt(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}
