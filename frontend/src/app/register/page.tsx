'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { setAuth } from '@/lib/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    business_name: '',
    business_phone: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirmation) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await authService.registerTenant(form);
      setAuth(token, user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">♻ RWM</h1>
          <p className="text-gray-500 mt-1">Đăng ký kho ve chai của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800">Tạo tài khoản</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input label="Tên kho / cơ sở" value={form.business_name} onChange={set('business_name')} placeholder="Kho ve chai Minh Anh" required />
            </div>
            <div className="col-span-2">
              <Input label="SĐT kho (tuỳ chọn)" value={form.business_phone} onChange={set('business_phone')} placeholder="0901234567" />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium text-gray-500">Thông tin chủ kho</p>
            <Input label="Họ tên" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn A" required />
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" required />
            <Input label="Mật khẩu" type="password" value={form.password} onChange={set('password')} placeholder="Tối thiểu 8 ký tự" required />
            <Input label="Xác nhận mật khẩu" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Nhập lại mật khẩu" required />
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Đăng ký
          </Button>

          <p className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
