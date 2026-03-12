'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import Card from '@/components/ui/Card';

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(n);
}

export default function InventoryPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAll,
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Tồn kho</h1>

      <Card>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có dữ liệu tồn kho.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 pr-4">Vật liệu</th>
                <th className="text-left py-2 pr-4">Đơn vị</th>
                <th className="text-right py-2 pr-4">Tổng tồn</th>
                <th className="text-right py-2">Cập nhật lúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-3 pr-4 font-medium">{inv.material.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{inv.material.unit}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-semibold ${inv.total_weight < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {fmt(inv.total_weight)}
                    </span>
                    {inv.total_weight < 10 && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Thấp</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-400 text-xs">
                    {inv.updated_at ? new Date(inv.updated_at).toLocaleString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
