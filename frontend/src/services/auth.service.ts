import api from '@/lib/axios';
import { User } from '@/types';

export const authService = {
  async registerTenant(data: {
    business_name: string;
    business_phone?: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/register-tenant', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    const res = await api.get('/me');
    return res.data;
  },
};
