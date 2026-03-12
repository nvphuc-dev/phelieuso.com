'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { getUser } from '@/lib/auth';
import { User } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  ArrowLeft, Camera, Trash2, KeyRound,
  BadgeCheck, User as UserIcon, DollarSign,
} from 'lucide-react';

const ROLE_LABEL: Record<string, string> = {
  owner: 'Chủ vựa', manager: 'Quản lý', employee: 'Nhân viên',
};
const ROLE_COLOR: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-gray-100 text-gray-600',
};

export default function UserProfilePage() {
  const params = useParams();
  const userId = Number(params.id);
  const qc = useQueryClient();

  const [me, setMe] = useState<User | null>(null);
  useEffect(() => { setMe(getUser()); }, []);

  const isSelf  = me?.id === userId;
  const isOwner = me?.role === 'owner';
  const canEdit = isSelf || isOwner;

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: !!userId,
    // Nếu là profile bản thân, dùng data từ localStorage làm placeholder
    placeholderData: isSelf && me ? me : undefined,
    retry: 1,
  });

  /* ── Avatar ── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userService.updateAvatar(userId, file),
    onSuccess: (updated) => {
      qc.setQueryData(['user', userId], updated);
      setPreview(null);
    },
  });
  const removeAvatarMutation = useMutation({
    mutationFn: () => userService.removeAvatar(userId),
    onSuccess: (updated) => { qc.setQueryData(['user', userId], updated); },
  });

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    avatarMutation.mutate(file);
  }

  /* ── Change Password ── */
  const [pwForm, setPwForm] = useState({
    current_password: '', new_password: '', new_password_confirmation: '',
  });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const changePwMutation = useMutation({
    mutationFn: () => userService.changePassword(userId, isSelf ? pwForm : {
      new_password: pwForm.new_password,
      new_password_confirmation: pwForm.new_password_confirmation,
    }),
    onSuccess: () => {
      setPwMsg({ ok: true, text: 'Đã đổi mật khẩu thành công.' });
      setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    },
    onError: (err: any) => {
      setPwMsg({ ok: false, text: err?.response?.data?.message ?? 'Có lỗi xảy ra.' });
    },
  });

  if (!me || (isLoading && !user)) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError && !user) {
    return (
      <div className="text-center py-20 max-w-md mx-auto space-y-3">
        <p className="text-red-500 font-medium">Không thể tải thông tin người dùng.</p>
        <p className="text-sm text-gray-400">Bạn không có quyền truy cập hoặc tài khoản không tồn tại.</p>
        <Link href="/purchases"><Button variant="secondary" size="sm">Quay lại</Button></Link>
      </div>
    );
  }

  if (!user) return null;

  const avatarSrc = preview ?? user.avatar_url ?? null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/users"><Button variant="ghost" size="sm"><ArrowLeft size={16} /></Button></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Avatar + Info */}
      <Card>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0 relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={36} className="text-gray-400" />
              )}
            </div>
            {canEdit && (
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                  title="Đổi ảnh"
                >
                  <Camera size={14} className="text-gray-700" />
                </button>
                {user.avatar && (
                  <button
                    onClick={() => removeAvatarMutation.mutate()}
                    className="p-1.5 bg-white rounded-full hover:bg-red-50"
                    title="Xoá ảnh"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            {avatarMutation.isPending && (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLOR[user.role]}`}>
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {user.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-gray-600">
              <div><span className="text-gray-400">Họ tên:</span> <span className="font-medium text-gray-800">{user.name}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="font-medium text-gray-800">{user.email}</span></div>
              <div><span className="text-gray-400">Tham gia:</span> {new Date(user.created_at).toLocaleDateString('vi-VN')}</div>
            </div>
            {canEdit && (
              <p className="text-xs text-gray-400">Di chuột vào ảnh để đổi avatar</p>
            )}
          </div>
        </div>

        {/* Salary link (owner/manager only) */}
        {(isOwner || me.role === 'manager') && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href={`/users/${user.id}/salary`}>
              <Button variant="secondary" size="sm">
                <DollarSign size={15} /> Quản lý lương tháng
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Change Password */}
      {canEdit && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-800">Đổi mật khẩu</h2>
          </div>
          <div className="space-y-3 max-w-sm">
            {isSelf && (
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                value={pwForm.current_password}
                onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                autoComplete="current-password"
              />
            )}
            {!isSelf && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Bạn đang đặt lại mật khẩu cho <strong>{user.name}</strong> — không cần mật khẩu cũ.
              </p>
            )}
            <Input
              label="Mật khẩu mới"
              type="password"
              value={pwForm.new_password}
              onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
              autoComplete="new-password"
            />
            <Input
              label="Xác nhận mật khẩu mới"
              type="password"
              value={pwForm.new_password_confirmation}
              onChange={(e) => setPwForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
              autoComplete="new-password"
            />
            {pwMsg && (
              <p className={`text-sm px-3 py-2 rounded-lg ${pwMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {pwMsg.text}
              </p>
            )}
            <Button
              size="sm"
              loading={changePwMutation.isPending}
              disabled={!pwForm.new_password || !pwForm.new_password_confirmation}
              onClick={() => { setPwMsg(null); changePwMutation.mutate(); }}
            >
              <BadgeCheck size={15} /> Lưu mật khẩu
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
