import api from '@/lib/axios';
import { PurchaseOrder, PaginatedResponse } from '@/types';

export interface PurchaseItemInput {
  material_id: number;
  weight: number;
  price_per_unit: number;
  note?: string;
}

export interface CreatePurchaseInput {
  customer_id: number;
  date: string;
  time: string;
  note?: string;
  items: PurchaseItemInput[];
}

export const purchaseService = {
  async getAll(params?: { from?: string; to?: string; status?: string; page?: number }): Promise<PaginatedResponse<PurchaseOrder>> {
    const res = await api.get('/purchases', { params });
    return res.data;
  },

  async getById(id: number): Promise<PurchaseOrder> {
    const res = await api.get(`/purchases/${id}`);
    return res.data;
  },

  async create(data: CreatePurchaseInput): Promise<PurchaseOrder> {
    const res = await api.post('/purchases', data);
    return res.data;
  },

  async cancel(id: number): Promise<void> {
    await api.delete(`/purchases/${id}`);
  },
};
