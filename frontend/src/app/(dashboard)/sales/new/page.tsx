'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { materialService } from '@/services/material.service';
import { inventoryService } from '@/services/inventory.service';
import { salesService, SalesItemInput } from '@/services/sales.service';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ItemRow extends SalesItemInput { _key: number; }

let keySeq = 1;

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function NewSalePage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ _key: keySeq++, material_id: 0, weight: 0, price_per_unit: 0 }]);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5)); // HH:mm
  }, []);

  const { data: customers = [] } = useQuery({ queryKey: ['customers', 'buyer'], queryFn: () => customerService.getAll({ type: 'buyer' }) });
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: materialService.getAll });
  const { data: inventory = [] } = useQuery({ queryKey: ['inventory'], queryFn: inventoryService.getAll });

  const getStock = (materialId: number) =>
    inventory.find((i) => i.material.id === materialId)?.total_weight ?? 0;

  const mutation = useMutation({
    mutationFn: salesService.create,
    onSuccess: () => router.push('/sales'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Lỗi tạo đơn');
    },
  });

  const addRow = () => setItems((p) => [...p, { _key: keySeq++, material_id: 0, weight: 0, price_per_unit: 0 }]);
  const removeRow = (key: number) => setItems((p) => p.filter((i) => i._key !== key));
  const updateRow = (key: number, field: keyof SalesItemInput, value: unknown) =>
    setItems((p) => p.map((i) => {
      if (i._key !== key) return i;
      const updated = { ...i, [field]: value };
      if (field === 'material_id') {
        const mat = materials.find((m) => m.id === Number(value));
        if (mat?.default_sale_price) updated.price_per_unit = Number(mat.default_sale_price);
      }
      return updated;
    }));

  const total = items.reduce((s, i) => s + (Number(i.weight) || 0) * (Number(i.price_per_unit) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customerId) { setError('Chọn người mua'); return; }
    if (!time) { setError('Chọn giờ giao dịch'); return; }
    if (items.some((i) => !i.material_id || !i.weight)) { setError('Điền đầy đủ thông tin các dòng hàng'); return; }

    mutation.mutate({
      customer_id: Number(customerId),
      date,
      time,
      note,
      items: items.map(({ _key, ...i }) => ({ ...i, weight: Number(i.weight), price_per_unit: Number(i.price_per_unit) })),
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/sales"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo đơn bán ra</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Thông tin đơn">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 relative">
              <SearchableSelect
                label="Người mua"
                placeholder="-- Chọn người mua --"
                searchPlaceholder="Tìm tên, SĐT..."
                options={customers.map((c) => ({
                  value: c.id,
                  label: c.name,
                  sub: c.phone ?? undefined,
                }))}
                value={customerId ? Number(customerId) : null}
                onChange={(v) => setCustomerId(v ? String(v) : '')}
                required
              />
            </div>
            <div className="col-span-2">
              <Input label="Ngày" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <Input label="Giờ" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            <div className="col-span-3">
              <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" />
            </div>
          </div>
        </Card>

        <Card title="Danh sách hàng">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 pr-3">Vật liệu</th>
                <th className="text-left py-2 pr-3 w-28">Cân nặng (kg)</th>
                <th className="text-left py-2 pr-3 w-36">Đơn giá (₫/kg)</th>
                <th className="text-right py-2 w-32">Thành tiền</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((row) => {
                const stock = row.material_id ? getStock(Number(row.material_id)) : 0;
                const overStock = row.material_id && Number(row.weight) > stock;
                return (
                  <tr key={row._key}>
                    <td className="py-1.5 pr-3">
                      <Select value={row.material_id || ''} onChange={(e) => updateRow(row._key, 'material_id', Number(e.target.value))}>
                        <option value="">-- Chọn --</option>
                        {materials.map((m) => <option key={m.id} value={m.id}>{m.name} (tồn: {new Intl.NumberFormat('vi-VN').format(getStock(m.id))} kg)</option>)}
                      </Select>
                    </td>
                    <td className="py-1.5 pr-3">
                      <Input type="number" step="0.001" min="0" value={row.weight || ''} onChange={(e) => updateRow(row._key, 'weight', e.target.value)}
                        className={overStock ? 'border-red-400' : ''} placeholder="0" />
                      {overStock && <p className="text-xs text-red-500 mt-0.5">Vượt tồn kho ({stock} kg)</p>}
                    </td>
                    <td className="py-1.5 pr-3">
                      <Input type="number" step="1" min="0" value={row.price_per_unit || ''} onChange={(e) => updateRow(row._key, 'price_per_unit', e.target.value)} placeholder="0" />
                    </td>
                    <td className="py-1.5 text-right font-medium text-gray-700">
                      {new Intl.NumberFormat('vi-VN').format((Number(row.weight) || 0) * (Number(row.price_per_unit) || 0))} ₫
                    </td>
                    <td className="py-1.5 pl-2">
                      <Button variant="ghost" size="sm" type="button" className="text-red-400" onClick={() => removeRow(row._key)} disabled={items.length === 1}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <Button variant="secondary" size="sm" type="button" onClick={addRow}><Plus size={14} /> Thêm dòng</Button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tổng cộng</p>
              <p className="text-xl font-bold text-emerald-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/sales"><Button variant="secondary" type="button">Huỷ</Button></Link>
          <Button type="submit" loading={mutation.isPending}>Lưu đơn bán</Button>
        </div>
      </form>
    </div>
  );
}
