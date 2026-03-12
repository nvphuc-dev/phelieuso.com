'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/axios';
import { User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check, UserCircle, DollarSign, User as UserIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { getUser } from '@/lib/auth';

const ROLE_LABEL: Record<string, string> = { owner: 'Chủ vựa', manager: 'Quản lý', employee: 'Nhân viên' };
const ROLE_COLOR: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-gray-100 text-gray-600',
};

function UserForm({ onSave, onCancel, loading }: { onSave: (d: object) => void; onCancel: () => void; loading?: boolean }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', status: 'active' });
  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Input label="Họ tên" value={form.name} onChange={set('name')} required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="Mật khẩu" type="password" value={form.password} onChange={set('password')} required />
        <Select label="Vai trò" value={form.role} onChange={set('role') as React.ChangeEventHandler<HTMLSelectElement>}>
          <option value="manager">Quản lý</option>
          <option value="employee">Nhân viên</option>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={onCancel} type="button"><X size={14} /> Huỷ</Button>
        <Button size="sm" loading={loading} onClick={() => onSave(form)} type="button"><Check size={14} /> Lưu</Button>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  useEffect(() => { setMe(getUser()); }, []);
  const isOwner = me?.role === 'owner';

  const { data = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const r = await api.get('/users');
      return (r.data.data ?? r.data) as User[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => api.post('/users', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setCreating(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/users/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="space-y-5">
      <ConfirmModal
        open={deleteTarget !== null}
        title="Xoá nhân viên?"
        message={deleteTarget ? `Bạn có chắc muốn xoá tài khoản "${deleteTarget.name}"? Hành động này không thể khôi phục.` : ''}
        confirmLabel="Xoá"
        cancelLabel="Huỷ bỏ"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nhân viên</h1>
        <Button size="sm" onClick={() => setCreating(true)}><Plus size={16} /> Thêm</Button>
      </div>

      {creating && <UserForm onSave={(d) => createMutation.mutate(d)} onCancel={() => setCreating(false)} loading={createMutation.isPending} />}

      <Card>
        {isLoading ? <p className="text-sm text-gray-500">Đang tải...</p> : data.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có nhân viên.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="text-left py-2 pr-4">Nhân viên</th>
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2 pr-4">Vai trò</th>
                <th className="text-left py-2 pr-4">Trạng thái</th>
                <th className="text-right py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon size={14} className="text-gray-400" />
                        </div>
                      )}
                      <Link href={`/users/${u.id}`} className="font-medium hover:text-emerald-600 hover:underline">
                        {u.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500">{u.email}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLOR[u.role]}`}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    {/* Owner: click để toggle; Manager: chỉ hiển thị badge */}
                    {isOwner && u.role !== 'owner' ? (
                      <button
                        onClick={() => toggleStatusMutation.mutate(u.id)}
                        disabled={toggleStatusMutation.isPending}
                        title={u.status === 'active' ? 'Nhấn để tạm dừng' : 'Nhấn để kích hoạt'}
                        className="flex items-center gap-1.5 group"
                      >
                        {u.status === 'active' ? (
                          <>
                            <ToggleRight size={20} className="text-green-500 group-hover:text-green-600" />
                            <span className="text-xs font-medium text-green-700 group-hover:underline">Hoạt động</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-gray-400 group-hover:text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 group-hover:underline">Tạm dừng</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/users/${u.id}`}>
                        <Button variant="ghost" size="sm" title="Xem profile"><UserCircle size={14} /></Button>
                      </Link>
                      <Link href={`/users/${u.id}/salary`}>
                        <Button variant="ghost" size="sm" title="Quản lý lương"><DollarSign size={14} /></Button>
                      </Link>
                      {u.role !== 'owner' && (
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                          onClick={() => setDeleteTarget(u)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
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
