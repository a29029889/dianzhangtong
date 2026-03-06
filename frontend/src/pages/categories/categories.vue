<template>
  <view class="categories-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">分类管理</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="page-header">
    </view>

    <!-- 收入分类 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">收入分类</text>
        <view class="add-btn" @click="showAddDialog('income')">
          <text>+ 添加</text>
        </view>
      </view>
      <view class="category-list">
        <view 
          v-for="item in incomeCategories" 
          :key="item.id" 
          class="category-item"
        >
          <view class="category-info">
            <text class="category-name">{{ item.name }}</text>
          </view>
          <view class="category-actions">
            <text class="action-btn" @click="editCategory(item)">编辑</text>
            <text class="action-btn delete" @click="deleteCategory(item.id)">删除</text>
          </view>
        </view>
        <view v-if="incomeCategories.length === 0" class="empty-tip">
          <text>暂无收入分类</text>
        </view>
      </view>
    </view>

    <!-- 支出分类 -->
    <view class="category-section">
      <view class="section-header">
        <text class="section-title">支出分类</text>
        <view class="add-btn" @click="showAddDialog('expense')">
          <text>+ 添加</text>
        </view>
      </view>
      <view class="category-list">
        <view 
          v-for="item in expenseCategories" 
          :key="item.id" 
          class="category-item"
        >
          <view class="category-info">
            <text class="category-name">{{ item.name }}</text>
          </view>
          <view class="category-actions">
            <text class="action-btn" @click="editCategory(item)">编辑</text>
            <text class="action-btn delete" @click="deleteCategory(item.id)">删除</text>
          </view>
        </view>
        <view v-if="expenseCategories.length === 0" class="empty-tip">
          <text>暂无支出分类</text>
        </view>
      </view>
    </view>

    <!-- 添加/编辑弹窗 -->
    <uni-popup ref="popupDialog" type="bottom">
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">{{ isEditing ? '编辑分类' : '添加分类' }}</text>
        </view>
        <view class="dialog-form">
          <input 
            class="dialog-input" 
            v-model="categoryForm.name" 
            placeholder="分类名称" 
          />
          <view class="dialog-type" v-if="!isEditing">
            <text class="type-label">类型：</text>
            <radio-group @change="typeChange" class="type-group">
              <label class="type-option">
                <radio value="income" :checked="categoryForm.type === 'income'" />
                <text>收入</text>
              </label>
              <label class="type-option">
                <radio value="expense" :checked="categoryForm.type === 'expense'" />
                <text>支出</text>
              </label>
            </radio-group>
          </view>
          <view class="dialog-buttons">
            <view class="dialog-btn cancel" @click="closeDialog">
              <text>取消</text>
            </view>
            <view class="dialog-btn confirm" @click="submitCategory">
              <text>保存</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api/api';

const categories = ref<any[]>([]);

const incomeCategories = computed(() => 
  categories.value.filter(c => c.type === 'income')
);

const expenseCategories = computed(() => 
  categories.value.filter(c => c.type === 'expense')
);

const popupDialog = ref<any>(null);
const isEditing = ref(false);
const editingId = ref('');
const categoryForm = ref({
  name: '',
  type: 'expense' as 'income' | 'expense'
});

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await api.get('/categories');
    categories.value = res || [];
  } catch (error) {
    uni.showToast({ title: '获取分类失败', icon: 'none' });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 显示添加弹窗
const showAddDialog = (type: 'income' | 'expense') => {
  isEditing.value = false;
  editingId.value = '';
  categoryForm.value = { name: '', type };
  popupDialog.value.open();
};

// 编辑分类
const editCategory = (item: any) => {
  isEditing.value = true;
  editingId.value = item.id;
  categoryForm.value = { name: item.name, type: item.type };
  popupDialog.value.open();
};

// 关闭弹窗
const closeDialog = () => {
  popupDialog.value.close();
};

// 类型变更
const typeChange = (e: any) => {
  categoryForm.value.type = e.detail.value;
};

// 提交分类
const submitCategory = async () => {
  if (!categoryForm.value.name) {
    uni.showToast({ title: '请输入分类名称', icon: 'none' });
    return;
  }

  try {
    if (isEditing.value) {
      await api.put(`/categories/${editingId.value}`, {
        name: categoryForm.value.name
      });
      uni.showToast({ title: '修改成功', icon: 'success' });
    } else {
      await api.post('/categories', categoryForm.value);
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    closeDialog();
    fetchCategories();
  } catch (error: any) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' });
  }
};

// 删除分类
const deleteCategory = async (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除该分类吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await api.delete(`/categories/${id}`);
          uni.showToast({ title: '删除成功', icon: 'success' });
          fetchCategories();
        } catch (error: any) {
          uni.showToast({ title: error.message || '删除失败', icon: 'none' });
        }
      }
    }
  });
};

onMounted(() => {
  fetchCategories();
});
</script>

<style lang="scss" scoped>
.categories-page {
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

.category-section {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.add-btn {
  color: #007AFF;
  font-size: 28rpx;
}

.category-list {
  padding: 0 30rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 30rpx;
  color: #333;
}

.category-actions {
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
  padding: 60rpx 0;
  text-align: center;
  color: #999;
  font-size: 28rpx;
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

.dialog-type {
  display: flex;
  align-items: center;
}

.type-label {
  font-size: 28rpx;
  color: #333;
}

.type-group {
  display: flex;
  gap: 40rpx;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 10rpx;
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
