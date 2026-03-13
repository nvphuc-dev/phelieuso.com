'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { setAuth } from '@/lib/auth';
import { defaultHomePath } from '@/lib/permissions';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await authService.login(email, password);
      setAuth(token, user);
      router.push(defaultHomePath(user.role));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg    = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) {
        setError(msg ?? 'Tài khoản đã bị tạm dừng. Vui lòng liên hệ quản trị viên.');
      } else if (status === 401) {
        setError('Email hoặc mật khẩu không đúng.');
      } else {
        setError(msg || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">♻ RWM</h1>
          <p className="text-gray-500 mt-1 font-bold">Quản Lý Kho Ve Chai</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg md:p-8 p-4 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 text-center">Đăng Nhập</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Đăng nhập
          </Button>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-emerald-600 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
