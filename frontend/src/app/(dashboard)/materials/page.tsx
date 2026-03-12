'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialService } from '@/services/material.service';
import { Material } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

function MaterialForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: Partial<Material>;
  onSave: (data: Partial<Material>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    unit: initial?.unit ?? 'kg',
    default_purchase_price: (initial?.default_purchase_price ?? '') as number | string,
    default_sale_price: (initial?.default_sale_price ?? '') as number | string,
    description: initial?.description ?? '',
  });
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Input label="Tên vật liệu" value={form.name} onChange={set('name')} required />
        <Input label="Đơn vị" value={form.unit} onChange={set('unit')} placeholder="kg" />
        <Input label="Giá mua mặc định" type="number" value={form.default_purchase_price as string} onChange={set('default_purchase_price')} />
        <Input label="Giá bán mặc định" type="number" value={form.default_sale_price as string} onChange={set('default_sale_price')} />
        <Input label="Mô tả" value={form.description} onChange={set('description')} className="col-span-2" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onCancel} type="button"><X size={14} /> Huỷ</Button>
        <Button size="sm" loading={loading} onClick={() => onSave({
          ...form,
          default_purchase_price: form.default_purchase_price !== '' ? Number(form.default_purchase_price) : null,
          default_sale_price: form.default_sale_price !== '' ? Number(form.default_sale_price) : null,
        })} type="button"><Check size={14} /> Lưu</Button>
      </div>
    </div>
  );
}

function fmt(n?: number | null) {
  if (!n) return '—';
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫/kg';
}

export default function MaterialsPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: materialService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: materialService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['materials'] }); setCreating(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Material> }) =>
      materialService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['materials'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: materialService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="space-y-5">
      <ConfirmModal
        open={deleteTarget !== null}
        title="Xoá vật liệu?"
        message={deleteTarget ? `Bạn có chắc muốn xoá "${deleteTarget.name}"? Hành động này không thể khôi phục.` : ''}
        confirmLabel="Xoá"
        cancelLabel="Huỷ bỏ"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Vật liệu</h1>
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus size={16} /> Thêm mới
        </Button>
      </div>

      {creating && (
        <MaterialForm
          onSave={(d) => createMutation.mutate(d as Partial<Material>)}
          onCancel={() => setCreating(false)}
          loading={createMutation.isPending}
        />
      )}

      <Card>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có vật liệu nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 pr-4">Tên</th>
                <th className="text-left py-2 pr-4">Đơn vị</th>
                <th className="text-left py-2 pr-4">Giá mua</th>
                <th className="text-left py-2 pr-4">Giá bán</th>
                <th className="text-right py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((m) => (
                <tr key={m.id}>
                  {editing?.id === m.id ? (
                    <td colSpan={5} className="py-2">
                      <MaterialForm
                        initial={editing}
                        onSave={(d) => updateMutation.mutate({ id: m.id, data: d as Partial<Material> })}
                        onCancel={() => setEditing(null)}
                        loading={updateMutation.isPending}
                      />
                    </td>
                  ) : (
                    <>
                      <td className="py-2 pr-4 font-medium">{m.name}</td>
                      <td className="py-2 pr-4 text-gray-500">{m.unit}</td>
                      <td className="py-2 pr-4 text-gray-500">{fmt(m.default_purchase_price)}</td>
                      <td className="py-2 pr-4 text-gray-500">{fmt(m.default_sale_price)}</td>
                      <td className="py-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(m)}><Pencil size={14} /></Button>
                          <Button
                            variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteTarget(m)}
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
