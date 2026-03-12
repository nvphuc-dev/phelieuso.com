import api from '@/lib/axios';
import { Inventory, DashboardReport, CustomerMonthlyRevenue, CustomerBonusRow } from '@/types';

export const inventoryService = {
  async getAll(): Promise<Inventory[]> {
    const res = await api.get('/inventory');
    return res.data;
  },
};

export const reportService = {
  async getDashboard(params?: { from?: string; to?: string }): Promise<DashboardReport> {
    const res = await api.get('/reports/dashboard', { params });
    return res.data;
  },

  async getPurchaseReport(params?: { from?: string; to?: string }) {
    const res = await api.get('/reports/purchases', { params });
    return res.data;
  },

  async getSalesReport(params?: { from?: string; to?: string }) {
    const res = await api.get('/reports/sales', { params });
    return res.data;
  },

  async getInventoryReport() {
    const res = await api.get('/reports/inventory');
    return res.data;
  },

  async getCustomerRevenue(params: { year: number; customer_id?: number }): Promise<{ year: number; data: CustomerMonthlyRevenue[] }> {
    const res = await api.get('/reports/customer-revenue', { params });
    return res.data;
  },

  async getCustomerBonus(params: { year: number }): Promise<{ year: number; data: CustomerBonusRow[] }> {
    const res = await api.get('/reports/customer-bonus', { params });
    return res.data;
  },
};
