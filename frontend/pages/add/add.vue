<template>
  <view class="add-page">
    <!-- 收入/支出切换 -->
    <view class="type-switch">
      <view 
        :class="['type-btn', { active: form.type === 'expense' }]" 
        @click="form.type = 'expense'"
      >
        支出
      </view>
      <view 
        :class="['type-btn', { active: form.type === 'income' }]" 
        @click="form.type = 'income'"
      >
        收入
      </view>
    </view>

    <!-- 金额输入 -->
    <view class="amount-section">
      <text class="currency">¥</text>
      <input 
        class="amount-input" 
        type="digit" 
        v-model="form.amount" 
        placeholder="0.00"
        @input="onAmountInput"
      />
    </view>

    <!-- 分类选择 -->
    <view class="form-item" @click="showCategoryPicker = true">
      <text class="label">分类</text>
      <view class="value">
        <text>{{ selectedCategory?.name || '请选择' }}</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 店铺选择 -->
    <view class="form-item" @click="showShopPicker = true">
      <text class="label">店铺</text>
      <view class="value">
        <text>{{ selectedShop?.name || '请选择(可选)' }}</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="form-item" @click="showDatePicker = true">
      <text class="label">日期</text>
      <view class="value">
        <text>{{ form.date || today }}</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="form-item">
      <text class="label">备注</text>
      <input 
        class="remark-input" 
        v-model="form.description" 
        placeholder="添加备注(可选)"
      />
    </view>

    <!-- 快捷金额按钮 -->
    <view class="quick-amounts">
      <view 
        v-for="amount in quickAmounts" 
        :key="amount" 
        class="quick-btn"
        @click="form.amount = amount.toString()"
      >
        ¥{{ amount }}
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="submit-btn" @click="handleSubmit">
      <text>{{ isEdit ? '保存修改' : '保存' }}</text>
    </view>

    <!-- 删除按钮（编辑模式） -->
    <view v-if="isEdit" class="delete-btn" @click="handleDelete">
      <text>删除记录</text>
    </view>

    <!-- 分类选择器 -->
    <uni-popup ref="categoryPopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text @click="showCategoryPicker = false">取消</text>
          <text class="picker-title">选择分类</text>
          <text @click="confirmCategory">确定</text>
        </view>
        <view class="picker-content">
          <view 
            v-for="cat in filteredCategories" 
            :key="cat.id" 
            :class="['picker-item', { selected: tempCategory?.id === cat.id }]"
            @click="tempCategory = cat"
          >
            <text>{{ cat.name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 店铺选择器 -->
    <uni-popup ref="shopPopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text @click="showShopPicker = false">取消</text>
          <text class="picker-title">选择店铺</text>
          <text @click="confirmShop">确定</text>
        </view>
        <view class="picker-content">
          <view 
            v-for="shop in shops" 
            :key="shop.id" 
            :class="['picker-item', { selected: tempShop?.id === shop.id }]"
            @click="tempShop = shop"
          >
            <text>{{ shop.name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 日期选择器 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="picker-popup">
        <view class="picker-header">
          <text @click="showDatePicker = false">取消</text>
          <text class="picker-title">选择日期</text>
          <text @click="confirmDate">确定</text>
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

const quickAmounts = [10, 50, 100, 200, 500, 1000];

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
  background: #f5f5f5;
  padding: 30rpx;
}

.type-switch {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
}

.type-btn {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 30rpx;
  color: #666;

  &.active {
    background: #007AFF;
    color: #fff;
    font-weight: bold;
  }
}

.amount-section {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.currency {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.amount-input {
  flex: 1;
  font-size: 72rpx;
  font-weight: bold;
  color: #333;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label {
  font-size: 30rpx;
  color: #333;
}

.value {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 28rpx;
}

.arrow {
  margin-left: 10rpx;
  color: #ccc;
}

.remark-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333;
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.quick-btn {
  background: #fff;
  border-radius: 8rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  color: #333;
}

.submit-btn {
  background: #007AFF;
  border-radius: 50rpx;
  padding: 30rpx;
  text-align: center;
  margin-bottom: 20rpx;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.delete-btn {
  background: #fff;
  border: 2rpx solid #ff4d4f;
  border-radius: 50rpx;
  padding: 30rpx;
  text-align: center;

  text {
    color: #ff4d4f;
    font-size: 32rpx;
    font-weight: bold;
  }
}

.picker-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.picker-content {
  max-height: 600rpx;
  padding: 20rpx;
}

.picker-item {
  padding: 24rpx;
  text-align: center;
  border-radius: 8rpx;
  margin-bottom: 10rpx;

  &.selected {
    background: #e6f7ff;
    color: #007AFF;
  }
}

.date-picker-content {
  padding: 40rpx;
  text-align: center;
  font-size: 36rpx;
}
</style>
