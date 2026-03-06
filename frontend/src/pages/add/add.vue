<template>
  <view class="add-page">
    <!-- 顶部金额显示 -->
    <view class="amount-header">
      <view class="type-switch">
        <view 
          :class="['type-btn', { active: form.type === 'expense' }]" 
          @click="form.type = 'expense'"
        >
          <text class="type-icon">💸</text>
          <text>支出</text>
        </view>
        <view 
          :class="['type-btn', { active: form.type === 'income' }]" 
          @click="form.type = 'income'"
        >
          <text class="type-icon">💰</text>
          <text>收入</text>
        </view>
      </view>

      <view class="amount-display">
        <text class="currency">¥</text>
        <input 
          class="amount-input" 
          type="digit" 
          v-model="form.amount" 
          placeholder="0.00"
          @input="onAmountInput"
        />
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 分类选择 -->
      <view class="form-item" @click="showCategoryPicker = true">
        <view class="form-left">
          <text class="form-icon">📁</text>
          <text class="form-label">分类</text>
        </view>
        <view class="form-right">
          <text :class="['form-value', { placeholder: !selectedCategory }]">
            {{ selectedCategory?.name || '请选择分类' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 店铺选择 -->
      <view class="form-item" @click="showShopPicker = true">
        <view class="form-left">
          <text class="form-icon">🏪</text>
          <text class="form-label">店铺</text>
        </view>
        <view class="form-right">
          <text :class="['form-value', { placeholder: !selectedShop }]">
            {{ selectedShop?.name || '可选' }}
          </text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="form-item" @click="showDatePicker = true">
        <view class="form-left">
          <text class="form-icon">📅</text>
          <text class="form-label">日期</text>
        </view>
        <view class="form-right">
          <text class="form-value">{{ form.date || today }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-item remark-item">
        <view class="form-left">
          <text class="form-icon">📝</text>
          <text class="form-label">备注</text>
        </view>
        <input 
          class="remark-input" 
          v-model="form.description" 
          placeholder="添加备注..."
        />
      </view>
    </view>

    <!-- 快捷金额 -->
    <view class="quick-section">
      <text class="quick-title">快捷金额</text>
      <view class="quick-grid">
        <view 
          v-for="amount in quickAmounts" 
          :key="amount" 
          :class="['quick-btn', { active: form.amount === amount.toString() }]"
          @click="form.amount = amount.toString()"
        >
          ¥{{ amount }}
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view v-if="isEdit" class="action-btn delete" @click="handleDelete">
        <text>删除记录</text>
      </view>
      <view class="action-btn save" @click="handleSubmit">
        <text>{{ isEdit ? '保存修改' : '保存记录' }}</text>
      </view>
    </view>

    <!-- 分类选择器 -->
    <uni-popup ref="categoryPopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text class="picker-cancel" @click="showCategoryPicker = false">取消</text>
          <text class="picker-title">选择分类</text>
          <text class="picker-confirm" @click="confirmCategory">确定</text>
        </view>
        <scroll-view scroll-y class="picker-content">
          <view 
            v-for="cat in filteredCategories" 
            :key="cat.id" 
            :class="['picker-item', { selected: tempCategory?.id === cat.id }]"
            @click="tempCategory = cat"
          >
            <view class="picker-icon">{{ getCategoryIcon(cat.type) }}</view>
            <text>{{ cat.name }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 店铺选择器 -->
    <uni-popup ref="shopPopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text class="picker-cancel" @click="showShopPicker = false">取消</text>
          <text class="picker-title">选择店铺</text>
          <text class="picker-confirm" @click="confirmShop">确定</text>
        </view>
        <scroll-view scroll-y class="picker-content">
          <view 
            v-for="shop in shops" 
            :key="shop.id" 
            :class="['picker-item', { selected: tempShop?.id === shop.id }]"
            @click="tempShop = shop"
          >
            <view class="picker-icon">🏪</view>
            <text>{{ shop.name }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 日期选择器 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text class="picker-cancel" @click="showDatePicker = false">取消</text>
          <text class="picker-title">选择日期</text>
          <text class="picker-confirm" @click="confirmDate">确定</text>
        </view>
        <picker mode="date" :value="form.date || today" @change="onDateChange">
          <view class="date-picker-content">
            {{ form.date || today }}
          </view>
        </picker>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAccountStore } from '../../stores/account';
import { useCategoryStore, type Category, type Shop } from '../../stores/category';

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

const form = ref({
  amount: '',
  type: 'expense' as 'income' | 'expense',
  categoryId: '',
  shopId: '',
  description: '',
  date: ''
});

const isEdit = ref(false);
const editId = ref('');
const showCategoryPicker = ref(false);
const showShopPicker = ref(false);
const showDatePicker = ref(false);
const tempCategory = ref<Category | null>(null);
const tempShop = ref<Shop | null>(null);

const categories = computed(() => categoryStore.categories);
const shops = computed(() => categoryStore.shops);

// 过滤对应类型的分类
const filteredCategories = computed(() => {
  return categories.value.filter(c => c.type === form.value.type);
});

const selectedCategory = computed(() => {
  return categories.value.find(c => c.id === form.value.categoryId);
});

const selectedShop = computed(() => {
  return shops.value.find(s => s.id === form.value.shopId);
});

const today = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
});

const quickAmounts = [10, 20, 50, 100, 200, 500, 1000, 2000];

const getCategoryIcon = (type: string) => {
  return type === 'income' ? '💰' : '💸';
};

const onAmountInput = (e: any) => {
  form.value.amount = e.detail.value;
};

const confirmCategory = () => {
  if (tempCategory.value) {
    form.value.categoryId = tempCategory.value.id;
  }
  showCategoryPicker.value = false;
};

const confirmShop = () => {
  if (tempShop.value) {
    form.value.shopId = tempShop.value.id;
  }
  showShopPicker.value = false;
};

const confirmDate = () => {
  showDatePicker.value = false;
};

const onDateChange = (e: any) => {
  form.value.date = e.detail.value;
};

const handleSubmit = async () => {
  if (!form.value.amount) {
    uni.showToast({ title: '请输入金额', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '保存中...' });

  const data = {
    amount: parseFloat(form.value.amount),
    type: form.value.type,
    categoryId: form.value.categoryId || undefined,
    shopId: form.value.shopId || undefined,
    description: form.value.description || undefined,
    date: form.value.date || today.value
  };

  let result;
  if (isEdit.value) {
    result = await accountStore.updateAccount(editId.value, data);
  } else {
    result = await accountStore.createAccount(data);
  }

  uni.hideLoading();

  if (result.success) {
    uni.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/flow/flow' });
    }, 1000);
  } else {
    uni.showToast({ title: result.message || '保存失败', icon: 'none' });
  }
};

const handleDelete = async () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条记录吗？',
    success: async (res) => {
      if (res.confirm) {
        const result = await accountStore.deleteAccount(editId.value);
        if (result.success) {
          uni.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            uni.switchTab({ url: '/pages/flow/flow' });
          }, 1000);
        }
      }
    }
  });
};

// 获取URL参数
const getQuery = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).$page?.options || (currentPage as any).options || {};
  return options;
};

onMounted(async () => {
  // 加载分类和店铺
  await Promise.all([
    categoryStore.fetchCategories(),
    categoryStore.fetchShops()
  ]);

  // 检查是否为编辑模式
  const options = getQuery();
  if (options.id) {
    isEdit.value = true;
    editId.value = options.id;
    form.value.type = options.type || 'expense';
    form.value.amount = options.amount || '';
    form.value.categoryId = options.categoryId || '';
    form.value.description = options.description || '';
    form.value.date = options.date || '';
  } else {
    form.value.date = today.value;
  }
});
</script>

<style lang="scss" scoped>
.add-page {
  min-height: 100vh;
  background: #F7F8FA;
  padding-bottom: 160rpx;
}

/* 顶部金额 */
.amount-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  padding: 40rpx 32rpx 60rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.type-switch {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 6rpx;
  margin-bottom: 40rpx;
}

.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.25s ease;

  &.active {
    background: #fff;
    color: #FF6B6B;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }

  .type-icon {
    font-size: 32rpx;
  }
}

.amount-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 40rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 8rpx;
}

.amount-input {
  font-size: 80rpx;
  font-weight: 700;
  color: #fff;
  text-align: center;
  min-width: 300rpx;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

/* 表单区域 */
.form-section {
  background: #fff;
  margin: -40rpx 24rpx 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.08);
  overflow: hidden;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.form-left {
  display: flex;
  align-items: center;
}

.form-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.form-label {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.form-right {
  display: flex;
  align-items: center;
}

.form-value {
  font-size: 28rpx;
  color: #1A1A1A;
  
  &.placeholder {
    color: #BBBBBB;
  }
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
  margin-left: 8rpx;
}

.remark-item {
  .remark-input {
    flex: 1;
    text-align: right;
    font-size: 28rpx;
    color: #1A1A1A;
    padding: 0 16rpx;
    
    &::placeholder {
      color: #BBBBBB;
    }
  }
}

/* 快捷金额 */
.quick-section {
  padding: 0 24rpx;
}

.quick-title {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 16rpx;
  display: block;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.quick-btn {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #666666;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.25);
  }
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  border-radius: 24rpx;
  padding: 28rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &.save {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #fff;
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
  }
  
  &.delete {
    background: #fff;
    color: #FF4D4F;
    border: 2rpx solid #FF4D4F;
  }
}

/* 选择器弹窗 */
.picker-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 70vh;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #F0F2F5;
}

.picker-cancel, .picker-confirm {
  font-size: 30rpx;
  padding: 8rpx 16rpx;
}

.picker-cancel {
  color: #999999;
}

.picker-confirm {
  color: #FF6B6B;
  font-weight: 600;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.picker-content {
  max-height: 60vh;
  padding: 16rpx 24rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  font-size: 30rpx;
  color: #1A1A1A;
  transition: all 0.15s ease;
  
  &:active {
    background: #F7F8FA;
  }

  &.selected {
    background: rgba(255, 107, 107, 0.1);
    color: #FF6B6B;
    font-weight: 600;
  }
  
  .picker-icon {
    font-size: 36rpx;
    margin-right: 16rpx;
  }
}

.date-picker-content {
  padding: 60rpx;
  text-align: center;
  font-size: 40rpx;
  color: #1A1A1A;
}
</style>
