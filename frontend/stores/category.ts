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
      categories.value = res.data || [];
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取分类失败' };
    }
  }

  // 获取店铺列表
  async function fetchShops() {
    try {
      const res = await api.get('/shops');
      shops.value = res.data || [];
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取店铺失败' };
    }
  }

  // 创建分类
  async function createCategory(data: { name: string; type: 'income' | 'expense'; icon?: string }) {
    try {
      const res = await api.post('/categories', data);
      categories.value.push(res.data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || '创建分类失败' };
    }
  }

  // 创建店铺
  async function createShop(data: { name: string; description?: string }) {
    try {
      const res = await api.post('/shops', data);
      shops.value.push(res.data);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || '创建店铺失败' };
    }
  }

  return {
    categories,
    shops,
    fetchCategories,
    fetchShops,
    createCategory,
    createShop
  };
});
