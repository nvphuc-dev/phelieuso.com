'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/inventory.service';
import { CustomerBonusRow } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PrintLayout from '@/components/ui/PrintLayout';
import Link from 'next/link';
import { ArrowLeft, Gift, TrendingUp, Users, Printer } from 'lucide-react';

export default function CustomerBonusPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading } = useQuery({
    queryKey: ['customer-bonus', year],
    queryFn: () => reportService.getCustomerBonus({ year }),
  });

  const rows: CustomerBonusRow[] = data?.data ?? [];

  const totalRevenue = rows.reduce((s, r) => s + r.annual_total, 0);
  const totalBonus   = rows.reduce((s, r) => s + r.bonus_amount, 0);
  const withBonus    = rows.filter((r) => r.bonus_amount > 0);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 print:hidden">
        <div className="flex items-start gap-2">
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="mt-0.5 shrink-0"><ArrowLeft size={16} /></Button>
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Thưởng cuối năm</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">Thống kê doanh thu và thưởng theo % cho người bán</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0" onClick={() => window.print()}>
          <Printer size={15} /> In
        </Button>
      </div>

      {/* ── Year selector ── */}
      <div className="flex items-center gap-3 print:hidden">
        <span className="text-sm font-medium text-gray-700">Năm:</span>
        <div className="flex gap-1.5">
          {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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

      <PrintLayout
        title={`BẢNG THƯỞNG CUỐI NĂM ${year}`}
        subtitle="Thống kê doanh thu và thưởng theo % cho người bán"
      >
        {/* ── Summary cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg shrink-0"><Users size={18} className="text-blue-600" /></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Người bán có thưởng</p>
                <p className="text-xl font-bold text-gray-900">{withBonus.length} / {rows.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg shrink-0"><TrendingUp size={18} className="text-emerald-600" /></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Tổng doanh thu {year}</p>
                <p className="text-xl font-bold text-gray-900 break-all">{fmt(totalRevenue)}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg shrink-0"><Gift size={18} className="text-yellow-600" /></div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Tổng tiền thưởng</p>
                <p className="text-xl font-bold text-yellow-700 break-all">{fmt(totalBonus)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Detail section ── */}
        <Card className='mt-3'>
          <h2 className="text-base font-semibold text-gray-800 mb-3 print:hidden">
            Chi tiết thưởng — {year}
          </h2>

          {isLoading ? (
            <p className="text-gray-500 text-sm py-4 text-center">Đang tải...</p>
          ) : rows.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Chưa có dữ liệu năm {year}.</p>
          ) : (
            <>
              {/* ── Desktop table ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left py-2 pr-3">STT</th>
                      <th className="text-left py-2 pr-4">Tên khách hàng</th>
                      <th className="text-left py-2 pr-4">SĐT</th>
                      <th className="text-right py-2 pr-4">Số đơn</th>
                      <th className="text-right py-2 pr-4">Doanh thu</th>
                      <th className="text-right py-2 pr-4">% Thưởng</th>
                      <th className="text-right py-2">Tiền thưởng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((r, idx) => (
                      <tr key={r.customer_id} className={r.bonus_amount > 0 ? 'bg-yellow-50/50' : ''}>
                        <td className="py-2 pr-3 text-gray-400">{idx + 1}</td>
                        <td className="py-2 pr-4 font-medium">
                          <Link href={`/customers/${r.customer_id}/stats?year=${year}`}
                            className="hover:text-emerald-600 hover:underline print:no-underline print:text-black">
                            {r.customer_name}
                          </Link>
                        </td>
                        <td className="py-2 pr-4 text-gray-500">{r.customer_phone ?? '—'}</td>
                        <td className="py-2 pr-4 text-right text-gray-600">{r.order_count}</td>
                        <td className="py-2 pr-4 text-right font-medium">
                          {r.annual_total > 0 ? fmt(r.annual_total) : '—'}
                        </td>
                        <td className="py-2 pr-4 text-right">
                          {r.bonus_rate > 0 ? (
                            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                              {r.bonus_rate}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right font-bold">
                          {r.bonus_amount > 0 ? (
                            <span className="text-yellow-700">{fmt(r.bonus_amount)}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td colSpan={4} className="py-3 pr-4 text-gray-700">Tổng cộng</td>
                      <td className="py-3 pr-4 text-right text-emerald-700">{fmt(totalRevenue)}</td>
                      <td className="py-3 pr-4" />
                      <td className="py-3 text-right text-yellow-700">{fmt(totalBonus)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* ── Mobile card list ── */}
              <div className="md:hidden space-y-2">
                {rows.map((r, idx) => (
                  <div key={r.customer_id}
                    className={`rounded-xl border px-3 py-3 ${r.bonus_amount > 0 ? 'border-yellow-200 bg-yellow-50/60' : 'border-gray-100 bg-white'}`}>
                    {/* Row 1: index + name + phone */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs text-gray-400 mt-0.5 shrink-0 w-5">{idx + 1}</span>
                        <div className="min-w-0">
                          <Link href={`/customers/${r.customer_id}/stats?year=${year}`}
                            className="font-semibold text-gray-900 hover:text-emerald-600 block">
                            {r.customer_name}
                          </Link>
                          {r.customer_phone && (
                            <p className="text-xs text-gray-500 mt-0.5">📞 {r.customer_phone}</p>
                          )}
                        </div>
                      </div>
                      {/* Bonus amount */}
                      {r.bonus_amount > 0 ? (
                        <div className="text-right shrink-0">
                          <p className="text-xs text-yellow-600 font-medium">Thưởng</p>
                          <p className="font-bold text-yellow-700">{fmt(r.bonus_amount)}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0 mt-1">Không thưởng</span>
                      )}
                    </div>

                    {/* Row 2: stats */}
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>{r.order_count} đơn</span>
                      <span className="text-gray-300">·</span>
                      <span>DT: <span className="font-medium text-gray-700">{r.annual_total > 0 ? fmt(r.annual_total) : '—'}</span></span>
                      {r.bonus_rate > 0 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">{r.bonus_rate}%</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Mobile total row */}
                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300 px-1">
                  <div>
                    <p className="text-xs text-gray-500">Tổng doanh thu</p>
                    <p className="font-bold text-emerald-700">{fmt(totalRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tổng thưởng</p>
                    <p className="font-bold text-yellow-700">{fmt(totalBonus)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Info note */}
        <p className="text-xs text-gray-400 print:hidden mt-2">
          * Chỉ tính các đơn mua vào có trạng thái <strong>hoàn thành</strong>.
          Để điều chỉnh % thưởng, vào <Link href="/customers" className="underline">trang Khách hàng</Link> và chỉnh sửa từng người.
        </p>
      </PrintLayout>
    </div>
  );
}
