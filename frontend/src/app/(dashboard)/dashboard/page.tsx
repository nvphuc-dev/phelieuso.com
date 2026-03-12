'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/inventory.service';
import Card from '@/components/ui/Card';
import { TrendingUp, ShoppingCart, DollarSign } from 'lucide-react';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function DashboardPage() {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', today],
    queryFn: () => reportService.getDashboard({ from: today, to: today }),
    enabled: !!today,
  });

  const stats = [
    {
      label: 'Mua vào hôm nay',
      value: fmt(data?.purchases.total ?? 0),
      sub: `${data?.purchases.count ?? 0} đơn`,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Bán ra hôm nay',
      value: fmt(data?.sales.total ?? 0),
      sub: `${data?.sales.count ?? 0} đơn`,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Lợi nhuận ước tính',
      value: fmt(data?.profit_estimation ?? 0),
      sub: 'Bán - Mua',
      icon: DollarSign,
      color: (data?.profit_estimation ?? 0) >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hôm nay{today ? ` — ${today}` : ''}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <Card key={label} className="!p-0">
              <div className="p-6 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Mua vào gần đây">
          <p className="text-sm text-gray-500">Xem tại trang <a href="/purchases" className="text-emerald-600 hover:underline">Mua vào</a></p>
        </Card>
        <Card title="Bán ra gần đây">
          <p className="text-sm text-gray-500">Xem tại trang <a href="/sales" className="text-emerald-600 hover:underline">Bán ra</a></p>
        </Card>
      </div>
    </div>
  );
}
