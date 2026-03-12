import api from '@/lib/axios';
import { SalesOrder, PaginatedResponse } from '@/types';

export interface SalesItemInput {
  material_id: number;
  weight: number;
  price_per_unit: number;
  note?: string;
}

export interface CreateSalesInput {
  customer_id: number;
  date: string;
  time: string;
  note?: string;
  items: SalesItemInput[];
}

export const salesService = {
  async getAll(params?: { from?: string; to?: string; status?: string; page?: number }): Promise<PaginatedResponse<SalesOrder>> {
    const res = await api.get('/sales', { params });
    return res.data;
  },

  async getById(id: number): Promise<SalesOrder> {
    const res = await api.get(`/sales/${id}`);
    return res.data;
  },

  async create(data: CreateSalesInput): Promise<SalesOrder> {
    const res = await api.post('/sales', data);
    return res.data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/sales/${id}`);
  },
};
