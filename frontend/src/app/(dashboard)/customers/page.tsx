'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types';
import Card from '@/components/ui/Card';
import { includesNorm } from '@/lib/text';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, Pencil, Trash2, X, Check, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/ui/ConfirmModal';

function CustomerForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: Partial<Customer>;
  onSave: (data: Partial<Customer>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    address: initial?.address ?? '',
    type: initial?.type ?? 'seller',
    note: initial?.note ?? '',
    bonus_rate: initial?.bonus_rate?.toString() ?? '0',
  });
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Tên" value={form.name} onChange={set('name')} required />
        <Input label="SĐT" value={form.phone} onChange={set('phone')} />
        <Input label="Địa chỉ" value={form.address} onChange={set('address')} className="col-span-2" />
        <Select label="Loại" value={form.type} onChange={set('type') as React.ChangeEventHandler<HTMLSelectElement>}>
          <option value="seller">Người bán (seller)</option>
          <option value="buyer">Người mua (buyer)</option>
        </Select>
        <Input label="% Thưởng cuối năm" type="number" min="0" max="100" step="0.1"
          value={form.bonus_rate} onChange={set('bonus_rate')} />
        <Input label="Ghi chú" value={form.note} onChange={set('note')} className="col-span-2" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onCancel} type="button"><X size={14} /> Huỷ</Button>
        <Button size="sm" loading={loading} onClick={() => onSave({
          ...form,
          bonus_rate: form.bonus_rate !== '' ? Number(form.bonus_rate) : 0,
        })} type="button"><Check size={14} /> Lưu</Button>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['customers', typeFilter],
    queryFn: () => customerService.getAll({ type: typeFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setCreating(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Customer> }) =>
      customerService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setDeleteTarget(null);
    },
  });

  const filtered = data.filter((c) =>
    includesNorm(c.name, search) ||
    (c.phone ?? '').includes(search)
  );

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="space-y-5">
      <ConfirmModal
        open={deleteTarget !== null}
        title="Xoá khách hàng?"
        message={deleteTarget ? `Bạn có chắc muốn xoá "${deleteTarget.name}"? Hành động này không thể khôi phục.` : ''}
        confirmLabel="Xoá"
        cancelLabel="Huỷ bỏ"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
        <div className="flex gap-2">
          <Link href="/customers/bonus">
            <Button variant="secondary" size="sm">
              <BarChart2 size={16} /> Thưởng cuối năm
            </Button>
          </Link>
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus size={16} /> Thêm mới
          </Button>
        </div>
      </div>

      {creating && (
        <CustomerForm
          onSave={(d) => createMutation.mutate(d)}
          onCancel={() => setCreating(false)}
          loading={createMutation.isPending}
        />
      )}

      <div className="flex gap-3">
        <Input placeholder="Tìm tên, SĐT..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Tất cả</option>
          <option value="seller">Người bán</option>
          <option value="buyer">Người mua</option>
        </Select>
      </div>

      <Card>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có khách hàng nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 pr-4">Tên</th>
                <th className="text-left py-2 pr-4">SĐT</th>
                <th className="text-left py-2 pr-4">Địa chỉ</th>
                <th className="text-left py-2 pr-4">Loại</th>
                <th className="text-right py-2 pr-4">% Thưởng</th>
                <th className="text-right py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id}>
                  {editing?.id === c.id ? (
                    <td colSpan={6} className="py-2">
                      <CustomerForm
                        initial={editing}
                        onSave={(d) => updateMutation.mutate({ id: c.id, data: d })}
                        onCancel={() => setEditing(null)}
                        loading={updateMutation.isPending}
                      />
                    </td>
                  ) : (
                    <>
                      <td className="py-2 pr-4 font-medium">
                        <Link href={`/customers/${c.id}/stats`} className="hover:text-emerald-600 hover:underline">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{c.phone}</td>
                      <td className="py-2 pr-4 text-gray-500">{c.address}</td>
                      <td className="py-2 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.type === 'seller' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {c.type === 'seller' ? 'Người bán' : 'Người mua'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {c.bonus_rate > 0 ? (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                            {c.bonus_rate}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <Link href={`/customers/${c.id}/stats`}>
                            <Button variant="ghost" size="sm" title="Xem doanh thu"><BarChart2 size={14} /></Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setEditing(c)}><Pencil size={14} /></Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteTarget(c)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
