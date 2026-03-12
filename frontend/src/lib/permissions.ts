import { User } from '@/types';

const ROLE_ALLOWED_PATHS: Record<string, string[]> = {
  owner: ['*'],
  manager: [
    '/dashboard',
    '/customers',
    '/materials',
    '/purchases',
    '/sales',
    '/inventory',
    '/reports',
    '/customers/bonus',
    '/users',
  ],
  employee: [
    '/purchases',
    // /users/[id] được xử lý riêng bên dưới qua canAccess()
  ],
};

export function canAccess(user: User | null, pathname: string): boolean {
  if (!user) return false;

  const allowed = ROLE_ALLOWED_PATHS[user.role] ?? [];

  if (allowed.includes('*')) return true;

  // Nhân viên chỉ được vào trang profile của chính mình
  if (user.role === 'employee') {
    const ownProfile = `/users/${user.id}`;
    if (pathname === ownProfile || pathname.startsWith(ownProfile + '/')) {
      // Không cho vào trang lương (salary) — chỉ owner/manager
      if (pathname.startsWith(ownProfile + '/salary')) return false;
      return true;
    }
  }

  return allowed.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
}

/**
 * Trang mặc định sau khi đăng nhập theo role.
 */
export function defaultHomePath(role: string): string {
  if (role === 'employee') return '/purchases';
  return '/dashboard';
}
