import api from '@/lib/axios';
import { Material } from '@/types';

export const materialService = {
  async getAll(): Promise<Material[]> {
    const res = await api.get('/materials');
    return res.data;
  },

  async create(data: Partial<Material>): Promise<Material> {
    const res = await api.post('/materials', data);
    return res.data;
  },

  async update(id: number, data: Partial<Material>): Promise<Material> {
    const res = await api.put(`/materials/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/materials/${id}`);
  },
};
