<template>
  <view class="mine-page">
    <!-- 用户信息 -->
    <view class="user-info">
      <view class="avatar">
        <text>{{ avatarText }}</text>
      </view>
      <view class="info">
        <text class="username">{{ userInfo?.username || '用户' }}</text>
        <text class="uid">ID: {{ userInfo?.id?.slice(0, 8) || '-' }}</text>
      </view>
    </view>

    <!-- 店铺管理 -->
    <view class="section">
      <view class="section-title">店铺管理</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToShops">
          <text class="menu-label">我的店铺</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="showAddShop = true">
          <text class="menu-label">添加店铺</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <view class="section-title">数据管理</view>
      <view class="menu-list">
        <view class="menu-item" @click="exportData">
          <text class="menu-label">导出数据</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @click="importData">
          <text class="menu-label">导入数据</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 系统设置 -->
    <view class="section">
      <view class="section-title">系统设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToCategories">
          <text class="menu-label">分类管理</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item">
          <text class="menu-label">通知设置</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item">
          <text class="menu-label">关于</text>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-btn" @click="handleLogout">
      <text>退出登录</text>
    </view>

    <!-- 版本号 -->
    <view class="version">
      <text>店账通 v1.0.0</text>
    </view>

    <!-- 添加店铺弹窗 -->
    <uni-popup ref="addShopPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">添加店铺</text>
        </view>
        <view class="popup-form">
          <input 
            class="popup-input" 
            v-model="newShop.name" 
            placeholder="店铺名称" 
          />
          <input 
            class="popup-input" 
            v-model="newShop.description" 
            placeholder="店铺描述(可选)" 
          />
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

const showAddShop = ref(false);
const newShop = ref({
  name: '',
  description: ''
});

// 头像文字
const avatarText = computed(() => {
  const username = userInfo.value?.username || '用户';
  return username.charAt(0).toUpperCase();
});

// 获取用户信息
const fetchUserInfo = async () => {
  await authStore.getUserInfo();
  await categoryStore.fetchShops();
};

// 跳转到店铺管理
const goToShops = () => {
  uni.navigateTo({ url: '/pages/shops/shops' });
};

// 跳转到分类管理
const goToCategories = () => {
  uni.navigateTo({ url: '/pages/categories/categories' });
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
    // 获取所有数据
    const accounts = await uni.request({
      url: 'http://localhost:3000/api/accounts',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${authStore.token}`
      }
    });
    
    // 转换为CSV
    const data = accounts.data?.data || [];
    if (data.length === 0) {
      uni.hideLoading();
      uni.showToast({ title: '暂无数据可导出', icon: 'none' });
      return;
    }
    
    const headers = ['日期', '类型', '金额', '分类', '店铺', '备注'];
    const csvContent = [
      headers.join(','),
      ...data.map((item: any) => [
        item.date,
        item.type === 'income' ? '收入' : '支出',
        item.amount,
        item.categoryName || '',
        item.shopName || '',
        item.description || ''
      ].join(','))
    ].join('\n');
    
    // 保存文件
    const filePath = `${wx.env.USER_DATA_PATH}/dianzhangtong_export_${Date.now()}.csv`;
    const fs = uni.getFileSystemManager();
    await fs.writeFile({
      filePath,
      data: csvContent,
      encoding: 'utf8'
    });
    
    // 提示用户
    uni.hideLoading();
    uni.showModal({
      title: '导出成功',
      content: `数据已导出到: ${filePath}`,
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
  background: #f5f5f5;
  padding: 30rpx;
}

.user-info {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;

  text {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
  }
}

.info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.uid {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10rpx;
}

.section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
  padding-left: 10rpx;
}

.menu-list {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-label {
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  color: #ccc;
  font-size: 28rpx;
}

.logout-btn {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  text-align: center;
  margin-top: 40rpx;

  text {
    color: #ff4d4f;
    font-size: 30rpx;
  }
}

.version {
  text-align: center;
  margin-top: 40rpx;
  color: #ccc;
  font-size: 24rpx;
}

.popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
}

.popup-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.popup-input {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.popup-btn {
  background: #007AFF;
  border-radius: 50rpx;
  padding: 26rpx;
  text-align: center;
  margin-top: 20rpx;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}
</style>
