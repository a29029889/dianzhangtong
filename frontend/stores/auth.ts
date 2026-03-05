import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api/api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(uni.getStorageSync('token') || '');
  const userInfo = ref<any>(null);
  const isLoggedIn = computed(() => !!token.value);

  // 登录
  async function login(username: string, password: string) {
    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data?.access_token) {
        token.value = res.data.access_token;
        uni.setStorageSync('token', res.data.access_token);
        uni.setStorageSync('userId', res.data.userId);
        return { success: true };
      }
      return { success: false, message: '登录失败' };
    } catch (error: any) {
      return { success: false, message: error.message || '登录失败' };
    }
  }

  // 注册
  async function register(username: string, password: string) {
    try {
      const res = await api.post('/auth/register', { username, password });
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, message: error.message || '注册失败' };
    }
  }

  // 登出
  function logout() {
    token.value = '';
    userInfo.value = null;
    uni.removeStorageSync('token');
    uni.removeStorageSync('userId');
  }

  // 获取用户信息
  async function getUserInfo() {
    try {
      const res = await api.get('/users/profile');
      userInfo.value = res.data;
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, message: '获取用户信息失败' };
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo
  };
});
