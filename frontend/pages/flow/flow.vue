<template>
  <view class="flow-page">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showTypeFilter = true">
        <text>{{ typeLabel }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @click="showDateFilter = true">
        <text>{{ dateLabel }}</text>
        <text class="arrow">▼</text>
      </view>
      <view class="filter-item" @click="showCategoryFilter = true">
        <text>{{ categoryLabel }}</text>
        <text class="arrow">▼</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="label">收入</text>
        <text class="amount income">+¥{{ formatAmount(totalIncome) }}</text>
      </view>
      <view class="stat-item">
        <text class="label">支出</text>
        <text class="amount expense">-¥{{ formatAmount(totalExpense) }}</text>
      </view>
      <view class="stat-item">
        <text class="label">笔数</text>
        <text class="amount">{{ accounts.length }}</text>
      </view>
    </view>

    <!-- 流水列表 -->
    <scroll-view 
      class="flow-list" 
      scroll-y 
      @scrolltolower="loadMore"
    >
      <view v-if="accounts.length > 0">
        <view 
          v-for="item in accounts" 
          :key="item.id" 
          class="flow-item"
          @click="editAccount(item)"
        >
          <view class="flow-left">
            <view :class="['type-icon', item.type]">
              {{ item.type === 'income' ? '收' : '支' }}
            </view>
            <view class="flow-info">
              <text class="category">{{ item.categoryName || '未分类' }}</text>
              <text class="description">{{ item.description || '-' }}</text>
              <text class="date">{{ formatDate(item.date) }}</text>
            </view>
          </view>
          <view class="flow-right">
            <text :class="['amount', item.type]">
              {{ item.type === 'income' ? '+' : '-' }}¥{{ formatAmount(item.amount) }}
            </text>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="loading" class="loading">
          <text>加载中...</text>
        </view>
        <view v-if="!hasMore && accounts.length > 0" class="no-more">
          <text>没有更多了</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty">
        <text>暂无流水记录</text>
      </view>
    </scroll-view>

    <!-- 类型筛选弹窗 -->
    <uni-popup ref="typePopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text @click="showTypeFilter = false">取消</text>
          <text class="title">筛选类型</text>
          <text @click="confirmTypeFilter">确定</text>
        </view>
        <view class="popup-content">
          <view 
            v-for="item in typeOptions" 
            :key="item.value" 
            :class="['filter-option', { selected: filters.type === item.value }]"
            @click="tempFilters.type = item.value"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 日期筛选弹窗 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text @click="showDateFilter = false">取消</text>
          <text class="title">筛选日期</text>
          <text @click="confirmDateFilter">确定</text>
        </view>
        <view class="popup-content">
          <view 
            v-for="item in dateOptions" 
            :key="item.value" 
            :class="['filter-option', { selected: filters.dateRange === item.value }]"
            @click="selectDateRange(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
          <view class="date-range" v-if="filters.dateRange === 'custom'">
            <picker mode="date" :value="filters.startDate" @change="onStartDateChange">
              <view class="date-picker">{{ filters.startDate || '开始日期' }}</view>
            </picker>
            <text class="date-separator">至</text>
            <picker mode="date" :value="filters.endDate" @change="onEndDateChange">
              <view class="date-picker">{{ filters.endDate || '结束日期' }}</view>
            </picker>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 分类筛选弹窗 -->
    <uni-popup ref="categoryPopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text @click="showCategoryFilter = false">取消</text>
          <text class="title">筛选分类</text>
          <text @click="confirmCategoryFilter">确定</text>
        </view>
        <view class="popup-content">
          <view 
            :class="['filter-option', { selected: !filters.categoryId }]"
            @click="tempFilters.categoryId = ''"
          >
            <text>全部</text>
          </view>
          <view 
            v-for="cat in categories" 
            :key="cat.id" 
            :class="['filter-option', { selected: tempFilters.categoryId === cat.id }]"
            @click="tempFilters.categoryId = cat.id"
          >
            <text>{{ cat.name }}</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAccountStore } from '../../stores/account';
import { useCategoryStore } from '../../stores/category';

const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

const accounts = computed(() => accountStore.accounts);
const loading = computed(() => accountStore.loading);
const categories = computed(() => categoryStore.categories);

const page = ref(1);
const limit = ref(20);
const hasMore = ref(true);
const isFirstLoad = ref(true);

const filters = ref({
  type: '' as '' | 'income' | 'expense',
  categoryId: '',
  startDate: '',
  endDate: '',
  dateRange: 'all'
});

const tempFilters = ref({ ...filters.value });

const showTypeFilter = ref(false);
const showDateFilter = ref(false);
const showCategoryFilter = ref(false);

// 计算统计
const totalIncome = computed(() => {
  return accounts.value
    .filter(a => a.type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);
});

const totalExpense = computed(() => {
  return accounts.value
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + a.amount, 0);
});

// 筛选标签
const typeLabel = computed(() => {
  const map: Record<string, string> = { '': '类型', income: '收入', expense: '支出' };
  return map[filters.value.type];
});

const dateLabel = computed(() => {
  if (filters.value.dateRange === 'all') return '日期';
  const map: Record<string, string> = {
    today: '今日',
    week: '本周',
    month: '本月',
    custom: '自定义'
  };
  return map[filters.value.dateRange] || '日期';
});

const categoryLabel = computed(() => {
  if (!filters.value.categoryId) return '分类';
  const cat = categories.value.find(c => c.id === filters.value.categoryId);
  return cat?.name || '分类';
});

// 筛选选项
const typeOptions = [
  { label: '全部', value: '' },
  { label: '收入', value: 'income' },
  { label: '支出', value: 'expense' }
];

const dateOptions = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '自定义', value: 'custom' }
];

// 工具函数
const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

const getDateRange = (type: string) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (type === 'today') {
    return { startDate: today, endDate: today };
  }
  
  if (type === 'week') {
    const dayOfWeek = now.getDay() || 7;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + 1);
    const startStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    return { startDate: startStr, endDate: today };
  }
  
  if (type === 'month') {
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    return { startDate, endDate: today };
  }
  
  return { startDate: '', endDate: '' };
};

const selectDateRange = (value: string) => {
  tempFilters.value.dateRange = value;
  if (value !== 'custom') {
    const range = getDateRange(value);
    tempFilters.value.startDate = range.startDate;
    tempFilters.value.endDate = range.endDate;
  }
};

const onStartDateChange = (e: any) => {
  tempFilters.value.startDate = e.detail.value;
};

const onEndDateChange = (e: any) => {
  tempFilters.value.endDate = e.detail.value;
};

const confirmTypeFilter = () => {
  filters.value.type = tempFilters.value.type;
  showTypeFilter.value = false;
  refreshData();
};

const confirmDateFilter = () => {
  filters.value.dateRange = tempFilters.value.dateRange;
  filters.value.startDate = tempFilters.value.startDate;
  filters.value.endDate = tempFilters.value.endDate;
  showDateFilter.value = false;
  refreshData();
};

const confirmCategoryFilter = () => {
  filters.value.categoryId = tempFilters.value.categoryId;
  showCategoryFilter.value = false;
  refreshData();
};

const refreshData = async () => {
  page.value = 1;
  hasMore.value = true;
  await fetchData(true);
};

const fetchData = async (refresh = false) => {
  if (!refresh && !hasMore.value) return;
  
  const params = {
    type: filters.value.type || undefined,
    categoryId: filters.value.categoryId || undefined,
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    page: refresh ? 1 : page.value,
    limit: limit.value
  };

  const result = await accountStore.fetchAccounts(params);
  
  if (result.success) {
    if (refresh) {
      accounts.value = result.data?.data || [];
    } else {
      accounts.value = [...accounts.value, ...(result.data?.data || [])];
    }
    hasMore.value = accounts.value.length < (result.data?.total || 0);
    page.value++;
  }
  isFirstLoad.value = false;
};

const loadMore = () => {
  if (!loading.value && hasMore.value) {
    fetchData();
  }
};

const editAccount = (item: any) => {
  uni.navigateTo({
    url: `/pages/add/add?id=${item.id}&type=${item.type}&amount=${item.amount}&categoryId=${item.categoryId}&description=${item.description}&date=${item.date}`
  });
};

onMounted(async () => {
  await categoryStore.fetchCategories();
  await fetchData(true);
});
</script>

<style lang="scss" scoped>
.flow-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  flex: 1;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;

  .arrow {
    font-size: 20rpx;
    margin-left: 8rpx;
    color: #ccc;
  }
}

.stats-bar {
  display: flex;
  background: #fff;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .amount {
    font-size: 32rpx;
    font-weight: bold;

    &.income {
      color: #52c41a;
    }

    &.expense {
      color: #ff4d4f;
    }
  }
}

.flow-list {
  height: calc(100vh - 240rpx);
  padding: 0 20rpx;
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.flow-left {
  display: flex;
  align-items: center;
}

.type-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 20rpx;

  &.income {
    background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  }

  &.expense {
    background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
  }
}

.flow-info {
  display: flex;
  flex-direction: column;

  .category {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
  }

  .description {
    font-size: 26rpx;
    color: #999;
    margin-top: 6rpx;
  }

  .date {
    font-size: 24rpx;
    color: #ccc;
    margin-top: 6rpx;
  }
}

.flow-right {
  .amount {
    font-size: 34rpx;
    font-weight: bold;

    &.income {
      color: #52c41a;
    }

    &.expense {
      color: #ff4d4f;
    }
  }
}

.loading, .no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 26rpx;
}

.empty {
  text-align: center;
  padding: 100rpx;
  color: #999;
}

.filter-popup {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.popup-content {
  max-height: 600rpx;
  padding: 20rpx;
}

.filter-option {
  padding: 24rpx;
  text-align: center;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
  font-size: 30rpx;
  color: #666;

  &.selected {
    background: #e6f7ff;
    color: #007AFF;
    font-weight: bold;
  }
}

.date-range {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
}

.date-picker {
  background: #f5f5f5;
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.date-separator {
  margin: 0 20rpx;
  color: #999;
}
</style>
