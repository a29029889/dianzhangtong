<template>
  <view class="flow-page">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stats-card">
        <view class="stats-row">
          <view class="stats-item">
            <text class="stats-label">收入</text>
            <text class="stats-amount income">+¥{{ formatAmount(totalIncome) }}</text>
          </view>
          <view class="stats-divider"></view>
          <view class="stats-item">
            <text class="stats-label">支出</text>
            <text class="stats-amount expense">-¥{{ formatAmount(totalExpense) }}</text>
          </view>
        </view>
        <view class="stats-balance" :class="{ positive: balance >= 0, negative: balance < 0 }">
          <text class="balance-label">结余</text>
          <text class="balance-amount">{{ balance >= 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(balance)) }}</text>
        </view>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" @click="showTypeFilter = true">
        <text :class="['filter-value', { active: filters.type }]">{{ typeLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view class="filter-item" @click="showDateFilter = true">
        <text :class="['filter-value', { active: filters.dateRange !== 'all' }]">{{ dateLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
      <view class="filter-item" @click="showCategoryFilter = true">
        <text :class="['filter-value', { active: filters.categoryId }]">{{ categoryLabel }}</text>
        <text class="filter-arrow">▼</text>
      </view>
    </view>

    <!-- 流水列表 -->
    <scroll-view 
      class="flow-list" 
      scroll-y 
      @scrolltolower="loadMore"
      refresher-enabled="true"
      @refresherrefresh="onRefresh"
      :refresher-triggered="refreshing"
    >
      <view v-if="accounts.length > 0" class="list-content">
        <!-- 按日期分组 -->
        <view v-for="(group, date) in groupedAccounts" :key="date" class="date-group">
          <view class="date-header">
            <text class="date-text">{{ formatGroupDate(date) }}</text>
            <text class="date-summary">
              收 {{ formatAmount(getDayIncome(group)) }} / 支 {{ formatAmount(getDayExpense(group)) }}
            </text>
          </view>
          
          <view class="group-items">
            <view 
              v-for="item in group" 
              :key="item.id" 
              class="flow-item"
              @click="editAccount(item)"
            >
              <view class="flow-left">
                <view :class="['type-icon', item.type]">
                  <text>{{ item.type === 'income' ? '收' : '支' }}</text>
                </view>
                <view class="flow-info">
                  <text class="flow-category">{{ item.categoryName || '未分类' }}</text>
                  <text class="flow-desc">{{ item.description || '无备注' }}</text>
                </view>
              </view>
              <view class="flow-right">
                <text :class="['flow-amount', item.type]">
                  {{ item.type === 'income' ? '+' : '-' }}¥{{ formatAmount(item.amount) }}
                </text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多 -->
        <view v-if="loading" class="loading">
          <text>加载中...</text>
        </view>
        <view v-if="!hasMore && accounts.length > 0" class="no-more">
          <text>— 已经到底啦 —</text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无流水记录</text>
        <text class="empty-hint">点击"记一笔"添加第一笔记录</text>
      </view>
    </scroll-view>

    <!-- 类型筛选弹窗 -->
    <uni-popup ref="typePopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选类型</text>
        </view>
        <view class="popup-content">
          <view 
            v-for="item in typeOptions" 
            :key="item.value" 
            :class="['filter-option', { selected: filters.type === item.value }]"
            @click="selectType(item.value)"
          >
            <text>{{ item.label }}</text>
            <text v-if="filters.type === item.value" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 日期筛选弹窗 -->
    <uni-popup ref="datePopup" type="bottom">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选日期</text>
        </view>
        <view class="popup-content">
          <view 
            v-for="item in dateOptions" 
            :key="item.value" 
            :class="['filter-option', { selected: filters.dateRange === item.value }]"
            @click="selectDateRange(item.value)"
          >
            <text>{{ item.label }}</text>
            <text v-if="filters.dateRange === item.value" class="check-icon">✓</text>
          </view>
          <view v-if="filters.dateRange === 'custom'" class="date-range">
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
          <text class="popup-title">筛选分类</text>
        </view>
        <view class="popup-content">
          <view 
            :class="['filter-option', { selected: !filters.categoryId }]"
            @click="selectCategory('')"
          >
            <text>全部</text>
            <text v-if="!filters.categoryId" class="check-icon">✓</text>
          </view>
          <view 
            v-for="cat in categories" 
            :key="cat.id" 
            :class="['filter-option', { selected: filters.categoryId === cat.id }]"
            @click="selectCategory(cat.id)"
          >
            <text>{{ cat.name }}</text>
            <text v-if="filters.categoryId === cat.id" class="check-icon">✓</text>
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
const refreshing = ref(false);

const filters = ref({
  type: '' as '' | 'income' | 'expense',
  categoryId: '',
  startDate: '',
  endDate: '',
  dateRange: 'all'
});

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

const balance = computed(() => totalIncome.value - totalExpense.value);

// 按日期分组
const groupedAccounts = computed(() => {
  const groups: Record<string, typeof accounts.value> = {};
  accounts.value.forEach(item => {
    const date = item.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  // 按日期倒序
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
  const sortedGroups: Record<string, typeof accounts.value> = {};
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key];
  });
  return sortedGroups;
});

const getDayIncome = (group: typeof accounts.value) => {
  return group.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
};

const getDayExpense = (group: typeof accounts.value) => {
  return group.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
};

// 筛选标签
const typeLabel = computed(() => {
  const map: Record<string, string> = { '': '类型', income: '收入', expense: '支出' };
  return map[filters.value.type] || '类型';
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
  { label: '本月', value: 'month' }
];

// 工具函数
const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatGroupDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (dateStr === today) return '今天';
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) return '昨天';
  
  return `${date.getMonth() + 1}月${date.getDate()}日 ${['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}`;
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

const selectType = (value: string) => {
  filters.value.type = value as any;
  showTypeFilter.value = false;
  refreshData();
};

const selectDateRange = (value: string) => {
  filters.value.dateRange = value;
  if (value !== 'custom') {
    const range = getDateRange(value);
    filters.value.startDate = range.startDate;
    filters.value.endDate = range.endDate;
  }
  showDateFilter.value = false;
  refreshData();
};

const selectCategory = (value: string) => {
  filters.value.categoryId = value;
  showCategoryFilter.value = false;
  refreshData();
};

const onStartDateChange = (e: any) => {
  filters.value.startDate = e.detail.value;
};

const onEndDateChange = (e: any) => {
  filters.value.endDate = e.detail.value;
  refreshData();
};

const showTypeFilter = ref(false);
const showDateFilter = ref(false);
const showCategoryFilter = ref(false);

const refreshData = async () => {
  page.value = 1;
  hasMore.value = true;
  await fetchData(true);
};

const onRefresh = async () => {
  refreshing.value = true;
  await refreshData();
  refreshing.value = false;
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
  background: #F7F8FA;
}

/* 顶部统计 */
.stats-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  padding: 32rpx 24rpx 24rpx;
}

.stats-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.15);
}

.stats-row {
  display: flex;
  align-items: center;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.stats-amount {
  font-size: 36rpx;
  font-weight: 700;
  
  &.income { color: #52C41A; }
  &.expense { color: #FF4D4F; }
}

.stats-divider {
  width: 1rpx;
  height: 48rpx;
  background: #F0F2F5;
}

.stats-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F2F5;
  
  &.positive {
    .balance-label { color: #52C41A; }
    .balance-amount { color: #52C41A; }
  }
  
  &.negative {
    .balance-label { color: #FF4D4F; }
    .balance-amount { color: #FF4D4F; }
  }
}

.balance-label {
  font-size: 26rpx;
  font-weight: 500;
}

.balance-amount {
  font-size: 32rpx;
  font-weight: 700;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F2F5;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.filter-value {
  font-size: 26rpx;
  color: #999999;
  
  &.active {
    color: #FF6B6B;
    font-weight: 600;
  }
}

.filter-arrow {
  font-size: 18rpx;
  color: #CCCCCC;
}

/* 流水列表 */
.flow-list {
  height: calc(100vh - 280rpx);
  padding: 16rpx;
}

.list-content {
  padding-bottom: 20rpx;
}

.date-group {
  margin-bottom: 20rpx;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 12rpx;
}

.date-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.date-summary {
  font-size: 22rpx;
  color: #999999;
}

.group-items {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #F8F8F8;
  transition: background 0.15s ease;
  
  &:active {
    background: #FAFAFA;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.flow-left {
  display: flex;
  align-items: center;
}

.type-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  
  text {
    font-size: 26rpx;
    font-weight: 700;
    color: #fff;
  }
  
  &.income {
    background: linear-gradient(135deg, #52C41A 0%, #73D13D 100%);
  }
  
  &.expense {
    background: linear-gradient(135deg, #FF4D4F 0%, #FF7875 100%);
  }
}

.flow-info {
  display: flex;
  flex-direction: column;
}

.flow-category {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.flow-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

.flow-right {
  .flow-amount {
    font-size: 34rpx;
    font-weight: 700;
    
    &.income { color: #52C41A; }
    &.expense { color: #FF4D4F; }
  }
}

.loading, .no-more {
  text-align: center;
  padding: 32rpx;
  font-size: 24rpx;
  color: #BBBBBB;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  
  .empty-icon {
    font-size: 100rpx;
    margin-bottom: 24rpx;
    opacity: 0.5;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #666666;
  }
  
  .empty-hint {
    font-size: 24rpx;
    color: #999999;
    margin-top: 12rpx;
  }
}

/* 筛选弹窗 */
.filter-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
}

.popup-header {
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #F0F2F5;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.popup-content {
  max-height: 60vh;
  padding: 16rpx 24rpx;
}

.filter-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 20rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #1A1A1A;
  margin-bottom: 8rpx;
  transition: all 0.15s ease;
  
  &:active {
    background: #F7F8FA;
  }

  &.selected {
    color: #FF6B6B;
    font-weight: 600;
    background: rgba(255, 107, 107, 0.08);
  }
  
  .check-icon {
    color: #FF6B6B;
    font-weight: 700;
  }
}

.date-range {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  gap: 16rpx;
}

.date-picker {
  background: #F7F8FA;
  padding: 20rpx 32rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.date-separator {
  color: #999999;
}
</style>
