<template>
  <view class="mine-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-bg"></view>
      <view class="user-content">
        <view class="avatar">
          <text>{{ avatarText }}</text>
        </view>
        <view class="user-info">
          <text class="username">{{ userInfo?.username || '用户' }}</text>
          <text class="uid">ID: {{ userInfo?.id?.slice(0, 8) || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷数据 -->
    <view class="quick-stats">
      <view class="stat-item">
        <text class="stat-value">{{ shopCount }}</text>
        <text class="stat-label">店铺</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ categoryCount }}</text>
        <text class="stat-label">分类</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-value">{{ accountCount }}</text>
        <text class="stat-label">记录</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <text class="section-title">店铺管理</text>
      <view class="menu-grid">
        <view class="menu-item" @click="goToShops">
          <view class="menu-icon">🏪</view>
          <text class="menu-text">我的店铺</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="showAddShop = true">
          <view class="menu-icon">➕</view>
          <text class="menu-text">添加店铺</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-title">数据管理</text>
      <view class="menu-grid">
        <view class="menu-item" @click="exportData">
          <view class="menu-icon">📤</view>
          <text class="menu-text">导出数据</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="importData">
          <view class="menu-icon">📥</view>
          <text class="menu-text">导入数据</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <text class="section-title">系统设置</text>
      <view class="menu-grid">
        <view class="menu-item" @click="goToCategories">
          <view class="menu-icon">📁</view>
          <text class="menu-text">分类管理</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToSettings">
          <view class="menu-icon">🔔</view>
          <text class="menu-text">通知设置</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="goToInventory">
          <view class="menu-icon">⚠️</view>
          <text class="menu-text">库存预警</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于</text>
          <text class="menu-value">v1.0.0</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-area"></view>

    <!-- 添加店铺弹窗 -->
    <uni-popup ref="addShopPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">添加店铺</text>
        </view>
        <view class="popup-form">
          <view class="input-wrapper">
            <text class="input-icon">🏪</text>
            <input 
              class="popup-input" 
              v-model="newShop.name" 
              placeholder="店铺名称" 
            />
          </view>
          <view class="input-wrapper">
            <text class="input-icon">📝</text>
            <input 
              class="popup-input" 
              v-model="newShop.description" 
              placeholder="店铺描述(可选)" 
            />
          </view>
          <view class="popup-btn" @click="submitShop">
            <text>保存</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useCategoryStore } from '../../stores/category';

const authStore = useAuthStore();
const categoryStore = useCategoryStore();

const userInfo = computed(() => authStore.userInfo);
const shops = computed(() => categoryStore.shops);
const categories = computed(() => categoryStore.categories);

const showAddShop = ref(false);
const newShop = ref({
  name: '',
  description: ''
});

const shopCount = computed(() => shops.value.length);
const categoryCount = computed(() => categories.value.length);
const accountCount = ref(0);

// 头像文字
const avatarText = computed(() => {
  const username = userInfo.value?.username || '用户';
  return username.charAt(0).toUpperCase();
});

// 获取用户信息
const fetchUserInfo = async () => {
  await authStore.getUserInfo();
  await Promise.all([
    categoryStore.fetchShops(),
    categoryStore.fetchCategories()
  ]);
};

// 跳转到店铺管理
const goToShops = () => {
  uni.navigateTo({ url: '/pages/shops/shops' });
};

// 跳转到分类管理
const goToCategories = () => {
  uni.navigateTo({ url: '/pages/categories/categories' });
};

// 跳转到通知设置
const goToSettings = () => {
  uni.navigateTo({ url: '/pages/settings/settings' });
};

// 跳转到库存预警
const goToInventory = () => {
  uni.navigateTo({ url: '/pages/inventory/inventory' });
};

// 提交店铺
const submitShop = async () => {
  if (!newShop.value.name) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' });
    return;
  }

  const result = await categoryStore.createShop(newShop.value);
  if (result.success) {
    uni.showToast({ title: '添加成功', icon: 'success' });
    showAddShop.value = false;
    newShop.value = { name: '', description: '' };
  } else {
    uni.showToast({ title: result.message || '添加失败', icon: 'none' });
  }
};

// 导出数据
const exportData = async () => {
  uni.showLoading({ title: '导出中...' });
  
  try {
    const res = await uni.request({
      url: '/api/accounts',
      method: 'GET'
    });
    
    const data = res.data?.data || [];
    
    if (data.length === 0) {
      uni.hideLoading();
      uni.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }
    
    uni.hideLoading();
    uni.showModal({
      title: '导出成功',
      content: `共导出 ${data.length} 条记录`,
      showCancel: false
    });
  } catch (error) {
    uni.hideLoading();
    uni.showToast({ title: '导出失败', icon: 'none' });
  }
};

// 导入数据
const importData = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        authStore.logout();
        uni.reLaunch({ url: '/pages/login/login' });
      }
    }
  });
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchUserInfo();
  } else {
    uni.reLaunch({ url: '/pages/login/login' });
  }
});
</script>

<style lang="scss" scoped>
.mine-page {
  min-height: 100vh;
  background: #F7F8FA;
  padding-bottom: 40rpx;
}

/* 用户信息卡片 */
.user-card {
  position: relative;
  margin-bottom: 20rpx;
}

.user-bg {
  height: 280rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 0 0 40rpx 40rpx;
}

.user-content {
  position: absolute;
  top: 140rpx;
  left: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.15);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.25);
  
  text {
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.uid {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

/* 快捷统计 */
.quick-stats {
  display: flex;
  background: #fff;
  margin: 80rpx 24rpx 20rpx;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #FF6B6B;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #F0F2F5;
}

/* 功能菜单 */
.menu-section {
  padding: 0 24rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 12rpx;
  display: block;
  padding-left: 8rpx;
}

.menu-grid {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F8F8F8;
  transition: background 0.15s ease;
  
  &:active {
    background: #FAFAFA;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
}

.menu-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.menu-value {
  font-size: 24rpx;
  color: #999999;
}

/* 退出登录 */
.logout-section {
  padding: 40rpx 24rpx;
}

.logout-btn {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  text {
    color: #FF4D4F;
    font-size: 30rpx;
    font-weight: 600;
  }
}

.safe-area {
  height: 60rpx;
}

/* 添加店铺弹窗 */
.popup-content {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.popup-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.popup-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #F7F8FA;
  border-radius: 16rpx;
  padding: 0 24rpx;
}

.input-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.popup-input {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
  color: #1A1A1A;
}

.popup-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 24rpx;
  padding: 28rpx;
  text-align: center;
  margin-top: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
  }
}
</style>
