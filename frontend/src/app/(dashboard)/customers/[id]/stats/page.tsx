'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/inventory.service';
import { customerService } from '@/services/customer.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Gift, ShoppingCart } from 'lucide-react';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

export default function CustomerStatsPage() {
  const params = useParams();
  const customerId = Number(params.id);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customerService.getById(customerId),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['customer-revenue', customerId, year],
    queryFn: () => reportService.getCustomerRevenue({ year, customer_id: customerId }),
    enabled: !!customerId,
  });

  const info = data?.data?.[0];
  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  const maxMonthly = info
    ? Math.max(...Object.values(info.months).map((m) => m.total), 1)
    : 1;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/customers">
          <Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer?.name ?? 'Đang tải...'}
          </h1>
          {customer?.phone && (
            <p className="text-sm text-gray-500">{customer.phone}</p>
          )}
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Năm:</span>
        <div className="flex gap-1">
          {[new Date().getFullYear() - 1, new Date().getFullYear()].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                year === y
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card><p className="text-gray-500 text-sm">Đang tải dữ liệu...</p></Card>
      ) : !info ? (
        <Card>
          <p className="text-gray-500 text-sm text-center py-8">
            Chưa có giao dịch mua vào từ khách hàng này trong năm {year}.
          </p>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp size={18} className="text-blue-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Tổng doanh thu {year}</p>
                  <p className="text-xl font-bold text-gray-900">{fmt(info.annual_total)}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg"><ShoppingCart size={18} className="text-emerald-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">% Thưởng</p>
                  <p className="text-xl font-bold text-gray-900">{info.bonus_rate}%</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg"><Gift size={18} className="text-yellow-600" /></div>
                <div>
                  <p className="text-xs text-gray-500">Thưởng dự kiến</p>
                  <p className="text-xl font-bold text-yellow-700">{fmt(info.bonus_amount)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Bar chart — monthly */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-4">Doanh thu theo tháng — {year}</h2>
            <div className="flex items-end gap-2 h-40">
              {MONTHS.map((label, idx) => {
                const m = info.months[idx + 1] ?? { total: 0, count: 0 };
                const pct = (m.total / maxMonthly) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-emerald-500 rounded-t transition-all duration-300 hover:bg-emerald-600 cursor-pointer"
                      style={{ height: `${Math.max(pct, m.total > 0 ? 4 : 0)}%` }}
                    />
                    {/* Tooltip */}
                    {m.total > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        {fmt(m.total)}
                        <br />{m.count} đơn
                      </div>
                    )}
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly table */}
          <Card>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Chi tiết từng tháng</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-2 pr-4">Tháng</th>
                  <th className="text-right py-2 pr-4">Số đơn</th>
                  <th className="text-right py-2 pr-4">Doanh thu</th>
                  <th className="text-right py-2">Tỉ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MONTHS.map((label, idx) => {
                  const m = info.months[idx + 1] ?? { total: 0, count: 0 };
                  const pct = info.annual_total > 0 ? (m.total / info.annual_total * 100).toFixed(1) : '0';
                  return (
                    <tr key={idx} className={m.total === 0 ? 'opacity-40' : ''}>
                      <td className="py-2 pr-4 font-medium">{label}/{year}</td>
                      <td className="py-2 pr-4 text-right text-gray-600">{m.count}</td>
                      <td className="py-2 pr-4 text-right font-semibold">{m.total > 0 ? fmt(m.total) : '—'}</td>
                      <td className="py-2 text-right text-gray-500">{m.total > 0 ? `${pct}%` : '—'}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                  <td className="py-2 pr-4">Tổng cộng</td>
                  <td className="py-2 pr-4 text-right">
                    {Object.values(info.months).reduce((s, m) => s + m.count, 0)} đơn
                  </td>
                  <td className="py-2 pr-4 text-right text-emerald-700">{fmt(info.annual_total)}</td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tbody>
            </table>

            {info.bonus_rate > 0 && (
              <div className="mt-4 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <div className="text-sm text-yellow-800">
                  <span className="font-semibold">Thưởng cuối năm {year}:</span>{' '}
                  {fmt(info.annual_total)} × {info.bonus_rate}%
                </div>
                <div className="text-lg font-bold text-yellow-700">= {fmt(info.bonus_amount)}</div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
