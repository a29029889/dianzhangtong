import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../api/api';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  type: 'income' | 'expense';
}

export interface Shop {
  id: string;
  name: string;
  description?: string;
}

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([]);
  const shops = ref<Shop[]>([]);

  // 获取分类列表
  async function fetchCategories() {
    try {
      const res = await api.get('/categories');
      categories.value = res || [];
      return { success: true, data: res };
    } catch (error) {
      return { success: false, message: '获取分类失败' };
    }
  }

  // 获取店铺列表
  async function fetchShops() {
    try {
      const res = await api.get('/shops');
      shops.value = res || [];
      return { success: true, data: res };
    } catch (error) {
      return { success: false, message: '获取店铺失败' };
    }
  }

  // 创建分类
  async function createCategory(data: { name: string; type: 'income' | 'expense'; icon?: string }) {
    try {
      const res = await api.post('/categories', data);
      categories.value.push(res);
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error.message || '创建分类失败' };
    }
  }

  // 创建店铺
  async function createShop(data: { name: string; description?: string }) {
    try {
      const res = await api.post('/shops', data);
      shops.value.push(res);
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error.message || '创建店铺失败' };
    }
  }

  // 更新分类
  async function updateCategory(id: string, data: { name: string }) {
    try {
      const res = await api.put(`/categories/${id}`, data);
      const index = categories.value.findIndex(c => c.id === id);
      if (index !== -1) {
        categories.value[index] = res;
      }
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error.message || '更新分类失败' };
    }
  }

  // 删除分类
  async function deleteCategory(id: string) {
    try {
      await api.delete(`/categories/${id}`);
      categories.value = categories.value.filter(c => c.id !== id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || '删除分类失败' };
    }
  }

  // 更新店铺
  async function updateShop(id: string, data: { name: string; description?: string }) {
    try {
      const res = await api.put(`/shops/${id}`, data);
      const index = shops.value.findIndex(s => s.id === id);
      if (index !== -1) {
        shops.value[index] = res;
      }
      return { success: true, data: res };
    } catch (error: any) {
      return { success: false, message: error.message || '更新店铺失败' };
    }
  }

  // 删除店铺
  async function deleteShop(id: string) {
    try {
      await api.delete(`/shops/${id}`);
      shops.value = shops.value.filter(s => s.id !== id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || '删除店铺失败' };
    }
  }

  return {
    categories,
    shops,
    fetchCategories,
    fetchShops,
    createCategory,
    createShop,
    updateCategory,
    deleteCategory,
    updateShop,
    deleteShop
  };
});
