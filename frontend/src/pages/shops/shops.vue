<template>
  <view class="shops-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">店铺管理</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="page-header">
    </view>

    <!-- 店铺列表 -->
    <view class="shop-list">
      <view 
        v-for="item in shops" 
        :key="item.id" 
        class="shop-item"
      >
        <view class="shop-info">
          <text class="shop-name">{{ item.name }}</text>
          <text class="shop-desc" v-if="item.description">{{ item.description }}</text>
          <text class="shop-date">创建于：{{ formatDate(item.createdAt) }}</text>
        </view>
        <view class="shop-actions">
          <text class="action-btn" @click="editShop(item)">编辑</text>
          <text class="action-btn delete" @click="deleteShop(item.id)">删除</text>
        </view>
      </view>
      <view v-if="shops.length === 0" class="empty-tip">
        <text>暂无店铺</text>
      </view>
    </view>

    <!-- 添加店铺按钮 -->
    <view class="add-shop-btn" @click="showAddDialog">
      <text>+ 添加店铺</text>
    </view>

    <!-- 添加/编辑弹窗 -->
    <uni-popup ref="popupDialog" type="bottom">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑店铺' : '添加店铺' }}</text>
        </view>
        <view class="dialog-form">
          <input 
            class="dialog-input" 
            v-model="shopForm.name" 
            placeholder="店铺名称" 
          />
          <input 
            class="dialog-input" 
            v-model="shopForm.description" 
            placeholder="店铺描述(可选)" 
          />
          <view class="dialog-buttons">
            <view class="dialog-btn cancel" @click="closeDialog">
              <text>取消</text>
            </view>
            <view class="dialog-btn confirm" @click="submitShop">
              <text>保存</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/api';

const shops = ref<any[]>([]);

const popupDialog = ref<any>(null);
const isEditing = ref(false);
const editingId = ref('');
const shopForm = ref({
  name: '',
  description: ''
});

// 获取店铺列表
const fetchShops = async () => {
  try {
    const res = await api.get('/shops');
    shops.value = res || [];
  } catch (error) {
    uni.showToast({ title: '获取店铺失败', icon: 'none' });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 显示添加弹窗
const showAddDialog = () => {
  isEditing.value = false;
  editingId.value = '';
  shopForm.value = { name: '', description: '' };
  popupDialog.value.open();
};

// 编辑店铺
const editShop = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  shopForm.value = { name: item.name, description: item.description || '' };
  popupDialog.value.open();
};

// 关闭弹窗
const closeDialog = () => {
  popupDialog.value.close();
};

// 提交店铺
const submitShop = async () => {
  if (!shopForm.value.name) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' });
    return;
  }

  try {
    if (isEditing.value) {
      await api.put(`/shops/${editingId.value}`, shopForm.value);
      uni.showToast({ title: '修改成功', icon: 'success' });
    } else {
      await api.post('/shops', shopForm.value);
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    closeDialog();
    fetchShops();
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' });
  }
};

// 删除店铺
const deleteShop = async (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该店铺吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.delete(`/shops/${id}`);
          uni.showToast({ title: '删除成功', icon: 'success' });
          fetchShops();
        } catch (error: any) {
          uni.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      }
    }
  });
};

onMounted(() => {
  fetchShops();
});
</script>

<style lang="scss" scoped>
.shops-page {
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
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
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
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.nav-placeholder {
  width: 60rpx;
}

.page-header {
  margin-bottom: 30rpx;
  padding: 30rpx;
  padding-bottom: 0;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.shop-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.shop-desc {
  font-size: 26rpx;
  color: #666;
}

.shop-date {
  font-size: 24rpx;
  color: #999;
}

.shop-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  font-size: 26rpx;
  color: #007AFF;
  padding: 10rpx 20rpx;

  &.delete {
    color: #ff4d4f;
  }
}

.empty-tip {
  padding: 100rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.add-shop-btn {
  position: fixed;
  bottom: 40rpx;
  left: 30rpx;
  right: 30rpx;
  background: #007AFF;
  border-radius: 50rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.dialog-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
}

.dialog-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.dialog-input {
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
}

.dialog-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.dialog-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 50rpx;
  text-align: center;
  font-size: 30rpx;

  &.cancel {
    background: #f5f5f5;
    color: #666;
  }

  &.confirm {
    background: #007AFF;
    color: #fff;
  }
}
</style>
