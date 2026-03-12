import api from '@/lib/axios';
import { User, UserSalary } from '@/types';

export const userService = {
  async getAll(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data.data ?? res.data;
  },

  async getById(id: number): Promise<User> {
    const res = await api.get(`/users/${id}`);
    return res.data.data ?? res.data;
  },

  async updateAvatar(id: number, file: File): Promise<User> {
    const form = new FormData();
    form.append('avatar', file);
    const res = await api.post(`/users/${id}/avatar`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async removeAvatar(id: number): Promise<User> {
    const res = await api.delete(`/users/${id}/avatar`);
    return res.data.data;
  },

  async changePassword(
    id: number,
    payload: { current_password?: string; new_password: string; new_password_confirmation: string }
  ): Promise<void> {
    await api.post(`/users/${id}/change-password`, payload);
  },
};

export const salaryService = {
  async getByYear(userId: number, year: number): Promise<UserSalary[]> {
    const res = await api.get(`/users/${userId}/salaries`, { params: { year } });
    return res.data.data;
  },

  async getByMonth(userId: number, month: string): Promise<UserSalary | null> {
    const res = await api.get(`/users/${userId}/salaries/${month}`);
    return res.data.data;
  },

  async upsert(userId: number, month: string, data: Partial<UserSalary>): Promise<UserSalary> {
    const res = await api.put(`/users/${userId}/salaries/${month}`, data);
    return res.data.data;
  },
};
