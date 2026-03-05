import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/api';

export interface Account {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId?: string;
  categoryName?: string;
  shopId?: string;
  shopName?: string;
  description?: string;
  date: string;
  createdAt: string;
}

export interface QuickStats {
  todayIncome: number;
  todayExpense: number;
  weekIncome: number;
  weekExpense: number;
  monthIncome: number;
  monthExpense: number;
  balance: number;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export const useAccountStore = defineStore('account', () => {
  const accounts = ref<Account[]>([]);
  const quickStats = ref<QuickStats | null>(null);
  const trendData = ref<TrendData[]>([]);
  const categoryBreakdown = ref<CategoryBreakdown[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(20);
  const loading = ref(false);

  // 获取快捷统计
  async function fetchQuickStats() {
    try {
      const res = await api.get('/accounts/quick-stats');
      quickStats.value = res.data;
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取统计失败' };
    }
  }

  // 获取账目列表（分页）
  async function fetchAccounts(params?: {
    type?: string;
    categoryId?: string;
    shopId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    loading.value = true;
    try {
      const res = await api.get('/accounts', { params });
      accounts.value = res.data.data || [];
      total.value = res.data.total || 0;
      page.value = res.data.page || 1;
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取流水失败' };
    } finally {
      loading.value = false;
    }
  }

  // 创建账目
  async function createAccount(data: {
    amount: number;
    type: 'income' | 'expense';
    categoryId?: string;
    shopId?: string;
    description?: string;
    date?: string;
  }) {
    try {
      const res = await api.post('/accounts', data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || '创建失败' };
    }
  }

  // 更新账目
  async function updateAccount(id: string, data: Partial<{
    amount: number;
    type: 'income' | 'expense';
    categoryId: string;
    shopId: string;
    description: string;
    date: string;
  }>) {
    try {
      const res = await api.put(`/accounts/${id}`, data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || '更新失败' };
    }
  }

  // 删除账目
  async function deleteAccount(id: string) {
    try {
      await api.delete(`/accounts/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || '删除失败' };
    }
  }

  // 获取趋势数据
  async function fetchTrend(startDate: string, endDate: string, period: 'day' | 'week' | 'month' = 'day') {
    try {
      const res = await api.get('/accounts/trend', {
        params: { startDate, endDate, period }
      });
      trendData.value = res.data || [];
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取趋势失败' };
    }
  }

  // 获取分类占比
  async function fetchCategoryBreakdown(startDate: string, endDate: string, type?: string) {
    try {
      const res = await api.get('/accounts/category-breakdown', {
        params: { startDate, endDate, type }
      });
      categoryBreakdown.value = res.data || [];
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取分类统计失败' };
    }
  }

  // 获取余额
  async function fetchBalance(endDate?: string) {
    try {
      const res = await api.get('/accounts/balance', {
        params: { endDate }
      });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取余额失败' };
    }
  }

  return {
    accounts,
    quickStats,
    trendData,
    categoryBreakdown,
    total,
    page,
    limit,
    loading,
    fetchQuickStats,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    fetchTrend,
    fetchCategoryBreakdown,
    fetchBalance
  };
});
