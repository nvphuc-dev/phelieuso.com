import api from '@/lib/axios';
import { Customer } from '@/types';

export const customerService = {
  async getAll(params?: { type?: string; search?: string }): Promise<Customer[]> {
    const res = await api.get('/customers', { params });
    return res.data.data ?? res.data;
  },

  async getById(id: number): Promise<Customer> {
    const res = await api.get(`/customers/${id}`);
    return res.data.data ?? res.data;
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    const res = await api.post('/customers', data);
    return res.data.data ?? res.data;
  },

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const res = await api.put(`/customers/${id}`, data);
    return res.data.data ?? res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  },
};
