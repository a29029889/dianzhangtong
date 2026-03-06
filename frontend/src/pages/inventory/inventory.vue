<template>
  <view class="inventory-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">库存预警</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-num">{{ stats.total }}</text>
        <text class="stat-label">商品总数</text>
      </view>
      <view class="stat-card warning">
        <text class="stat-num">{{ stats.lowStock }}</text>
        <text class="stat-label">库存不足</text>
      </view>
      <view class="stat-card danger">
        <text class="stat-num">{{ stats.outOfStock }}</text>
        <text class="stat-label">已售罄</text>
      </view>
    </view>

    <!-- 低库存商品列表 -->
    <view class="section">
      <view class="section-title">预警商品</view>
      <view class="product-list" v-if="lowStockProducts.length > 0">
        <view 
          class="product-item" 
          v-for="item in lowStockProducts" 
          :key="item.id"
        >
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <text class="product-sku">{{ item.sku || '无SKU' }}</text>
          </view>
          <view class="product-stock">
            <text class="stock-num" :class="{ danger: item.stock === 0 }">
              {{ item.stock }}
            </text>
            <text class="stock-label">当前库存</text>
          </view>
          <view class="product-threshold">
            <text class="threshold-num">{{ item.lowStockThreshold }}</text>
            <text class="threshold-label">预警阈值</text>
          </view>
          <view class="product-actions">
            <view class="action-btn" @click="editThreshold(item)">
              <text>调整阈值</text>
            </view>
            <view class="action-btn primary" @click="addStock(item)">
              <text>补货</text>
            </view>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <text class="empty-icon">✓</text>
        <text class="empty-text">库存充足，无需预警</text>
      </view>
    </view>

    <!-- 调整阈值弹窗 -->
    <uni-popup ref="thresholdPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">设置预警阈值</text>
        </view>
        <view class="popup-form">
          <view class="popup-input-group">
            <text class="input-label">商品名称</text>
            <text class="input-value">{{ currentProduct?.name }}</text>
          </view>
          <view class="popup-input-group">
            <text class="input-label">预警阈值</text>
            <input 
              class="popup-input" 
              type="number"
              v-model="newThreshold" 
              placeholder="请输入预警阈值" 
            />
          </view>
          <view class="popup-btn-group">
            <view class="popup-btn cancel" @click="closeThresholdPopup">
              <text>取消</text>
            </view>
            <view class="popup-btn confirm" @click="saveThreshold">
              <text>保存</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 补货弹窗 -->
    <uni-popup ref="stockPopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">商品补货</text>
        </view>
        <view class="popup-form">
          <view class="popup-input-group">
            <text class="input-label">商品名称</text>
            <text class="input-value">{{ currentProduct?.name }}</text>
          </view>
          <view class="popup-input-group">
            <text class="input-label">当前库存</text>
            <text class="input-value">{{ currentProduct?.stock }}</text>
          </view>
          <view class="popup-input-group">
            <text class="input-label">补货数量</text>
            <input 
              class="popup-input" 
              type="number"
              v-model="addStockNum" 
              placeholder="请输入补货数量" 
            />
          </view>
          <view class="popup-btn-group">
            <view class="popup-btn cancel" @click="closeStockPopup">
              <text>取消</text>
            </view>
            <view class="popup-btn confirm" @click="confirmAddStock">
              <text>确认</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../api/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
}

const authStore = useAuthStore();

const stats = ref({ total: 0, lowStock: 0, outOfStock: 0 });
const lowStockProducts = ref<Product[]>([]);
const currentProduct = ref<Product | null>(null);
const newThreshold = ref(10);
const addStockNum = ref(0);

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 加载预警数据
const loadData = async () => {
  try {
    // 获取预警统计
    const statsRes = await api.get('/inventory/low-stock/stats');
    if (statsRes.data) {
      stats.value = statsRes.data;
    }
    
    // 获取预警商品列表
    const listRes = await api.get('/inventory/low-stock');
    if (listRes.data) {
      lowStockProducts.value = listRes.data;
    }
  } catch (error) {
    console.error('加载数据失败', error);
  }
};

// 编辑阈值
const editThreshold = (item: Product) => {
  currentProduct.value = item;
  newThreshold.value = item.lowStockThreshold;
  (uni as any).$u.throttle(() => {
    (uni as any).$nextTick(() => {
      // @ts-ignore
      thresholdPopup.value.open();
    });
  }, 100);
};

const closeThresholdPopup = () => {
  // @ts-ignore
  thresholdPopup.value.close();
};

const saveThreshold = async () => {
  if (!currentProduct.value) return;
  
  try {
    await api.put(`/inventory/${currentProduct.value.id}/threshold`, {
      lowStockThreshold: parseInt(newThreshold.value.toString())
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
    closeThresholdPopup();
    loadData();
  } catch (error) {
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
};

// 补货
const addStock = (item: Product) => {
  currentProduct.value = item;
  addStockNum.value = 0;
  setTimeout(() => {
    // @ts-ignore
    stockPopup.value.open();
  }, 100);
};

const closeStockPopup = () => {
  // @ts-ignore
  stockPopup.value.close();
};

const confirmAddStock = async () => {
  if (!currentProduct.value || addStockNum.value <= 0) {
    uni.showToast({ title: '请输入有效的补货数量', icon: 'none' });
    return;
  }
  
  try {
    const newStock = currentProduct.value.stock + parseInt(addStockNum.value.toString());
    await api.put(`/inventory/${currentProduct.value.id}/stock`, {
      stock: newStock
    });
    uni.showToast({ title: '补货成功', icon: 'success' });
    closeStockPopup();
    loadData();
  } catch (error) {
    uni.showToast({ title: '补货失败', icon: 'none' });
  }
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadData();
  } else {
    uni.reLaunch({ url: '/pages/login/login' });
  }
});
</script>

<style lang="scss" scoped>
.inventory-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 自定义导航栏 */
.custom-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.nav-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 44rpx;
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.nav-placeholder {
  width: 60rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }
}

.stats-cards {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  
  &.warning .stat-num {
    color: #faad14;
  }
  
  &.danger .stat-num {
    color: #ff4d4f;
  }
}

.stat-num {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.section {
  padding: 0 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  padding: 20rpx 0;
}

.product-list {
  background: #fff;
  border-radius: 16rpx;
}

.product-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.product-info {
  width: 30%;
  
  .product-name {
    font-size: 28rpx;
    color: #333;
    display: block;
  }
  
  .product-sku {
    font-size: 24rpx;
    color: #999;
  }
}

.product-stock, .product-threshold {
  width: 20%;
  text-align: center;
  
  .stock-num, .threshold-num {
    font-size: 32rpx;
    font-weight: bold;
    color: #faad14;
    display: block;
    
    &.danger {
      color: #ff4d4f;
    }
  }
  
  .stock-label, .threshold-label {
    font-size: 22rpx;
    color: #999;
  }
}

.product-actions {
  width: 30%;
  display: flex;
  gap: 10rpx;
}

.action-btn {
  flex: 1;
  padding: 12rpx 0;
  border-radius: 8rpx;
  text-align: center;
  background: #f5f5f5;
  
  text {
    font-size: 24rpx;
    color: #666;
  }
  
  &.primary {
    background: #007AFF;
    
    text {
      color: #fff;
    }
  }
}

.empty-state {
  background: #fff;
  border-radius: 16rpx;
  padding: 80rpx 0;
  text-align: center;
  
  .empty-icon {
    font-size: 80rpx;
    color: #52c41a;
    display: block;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
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

.popup-input-group {
  display: flex;
  flex-direction: column;
  
  .input-label {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 10rpx;
  }
  
  .input-value {
    font-size: 28rpx;
    color: #333;
  }
}

.popup-input {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.popup-btn-group {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.popup-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 50rpx;
  text-align: center;
  
  &.cancel {
    background: #f5f5f5;
    
    text {
      color: #666;
    }
  }
  
  &.confirm {
    background: #007AFF;
    
    text {
      color: #fff;
    }
  }
  
  text {
    font-size: 30rpx;
    font-weight: bold;
  }
}
</style>
