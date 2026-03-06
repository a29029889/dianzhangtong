<template>
  <view class="report-page">
    <!-- 顶部日期筛选 -->
    <view class="date-header">
      <view class="date-selector">
        <view 
          v-for="range in dateRanges" 
          :key="range.value" 
          :class="['date-btn', { active: selectedRange === range.value }]"
          @click="selectDateRange(range.value)"
        >
          {{ range.label }}
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="overview-card">
      <view class="overview-header">
        <text class="overview-title">收支概览</text>
      </view>
      <view class="overview-stats">
        <view class="stat-box income">
          <view class="stat-icon">↑</view>
          <view class="stat-info">
            <text class="stat-label">总收入</text>
            <text class="stat-value">+¥{{ formatAmount(totalIncome) }}</text>
          </view>
        </view>
        <view class="stat-box expense">
          <view class="stat-icon">↓</view>
          <view class="stat-info">
            <text class="stat-label">总支出</text>
            <text class="stat-value">-¥{{ formatAmount(totalExpense) }}</text>
          </view>
        </view>
      </view>
      <view class="overview-balance" :class="{ positive: balance >= 0, negative: balance < 0 }">
        <text class="balance-label">{{ balance >= 0 ? '结余' : '赤字' }}</text>
        <text class="balance-value">{{ balance >= 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(balance)) }}</text>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        :class="['tab-item', { active: activeTab === 'trend' }]" 
        @click="activeTab = 'trend'"
      >
        <text>趋势</text>
      </view>
      <view 
        :class="['tab-item', { active: activeTab === 'breakdown' }]" 
        @click="activeTab = 'breakdown'"
      >
        <text>分类</text>
      </view>
    </view>

    <!-- 趋势图 -->
    <view v-if="activeTab === 'trend'" class="trend-section">
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">收支趋势</text>
        </view>
        
        <!-- 简易柱状图 -->
        <view class="chart-container">
          <view class="chart-y-axis">
            <text>{{ formatChartY(maxValue) }}</text>
            <text>{{ formatChartY(maxValue / 2) }}</text>
            <text>0</text>
          </view>
          <view class="chart-bars">
            <view 
              v-for="(item, index) in trendData" 
              :key="index"
              class="bar-group"
            >
              <view class="bars-wrapper">
                <view 
                  class="bar income"
                  :style="{ height: getBarHeight(item.income) + 'rpx' }"
                ></view>
                <view 
                  class="bar expense"
                  :style="{ height: getBarHeight(item.expense) + 'rpx' }"
                ></view>
              </view>
              <text class="bar-label">{{ formatChartDate(item.date) }}</text>
            </view>
          </view>
        </view>
        
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-dot income"></view>
            <text>收入</text>
          </view>
          <view class="legend-item">
            <view class="legend-dot expense"></view>
            <text>支出</text>
          </view>
        </view>
      </view>

      <!-- 日均数据 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">日均统计</text>
        </view>
        <view class="daily-stats">
          <view class="daily-item">
            <text class="daily-label">日均收入</text>
            <text class="daily-value income">+¥{{ formatAmount(avgIncome) }}</text>
          </view>
          <view class="daily-item">
            <text class="daily-label">日均支出</text>
            <text class="daily-value expense">-¥{{ formatAmount(avgExpense) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类占比 -->
    <view v-if="activeTab === 'breakdown'" class="breakdown-section">
      <!-- 支出分类 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">支出分类</text>
          <text class="section-subtitle">共 {{ categoryBreakdown.length }} 个分类</text>
        </view>
        
        <view v-if="categoryBreakdown.length > 0">
          <!-- 环形图 -->
          <view class="pie-wrapper">
            <view class="pie-chart">
              <view 
                v-for="(item, index) in categoryBreakdown.slice(0, 5)" 
                :key="index"
                class="pie-segment"
                :style="getPieStyle(item.percentage, index)"
              ></view>
            </view>
            <view class="pie-center">
              <text class="pie-total-label">总支出</text>
              <text class="pie-total-value">¥{{ formatAmount(totalExpense) }}</text>
            </view>
          </view>

          <!-- 分类列表 -->
          <view class="category-list">
            <view 
              v-for="(item, index) in categoryBreakdown" 
              :key="index"
              class="category-item"
            >
              <view class="category-left">
                <view class="category-index">{{ index + 1 }}</view>
                <view class="category-color" :style="{ background: colorList[index % colorList.length] }"></view>
                <text class="category-name">{{ item.categoryName }}</text>
              </view>
              <view class="category-right">
                <text class="category-amount">¥{{ formatAmount(item.amount) }}</text>
                <text class="category-percent">{{ item.percentage.toFixed(1) }}%</text>
              </view>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-tip">
          <text>暂无支出记录</text>
        </view>
      </view>

      <!-- 收入分类 -->
      <view class="section-card">
        <view class="section-header">
          <text class="section-title">收入分类</text>
          <text class="section-subtitle">共 {{ incomeBreakdown.length }} 个分类</text>
        </view>
        
        <view v-if="incomeBreakdown.length > 0">
          <view class="category-list">
            <view 
              v-for="(item, index) in incomeBreakdown" 
              :key="'income-' + index"
              class="category-item"
            >
              <view class="category-left">
                <view class="category-index">{{ index + 1 }}</view>
                <view class="category-color" :style="{ background: colorList[index % colorList.length] }"></view>
                <text class="category-name">{{ item.categoryName }}</text>
              </view>
              <view class="category-right">
                <text class="category-amount income">+¥{{ formatAmount(item.amount) }}</text>
                <text class="category-percent">{{ item.percentage.toFixed(1) }}%</text>
              </view>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-tip">
          <text>暂无收入记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAccountStore } from '../../stores/account';

const accountStore = useAccountStore();

const activeTab = ref('trend');
const selectedRange = ref('week');
const trendData = computed(() => accountStore.trendData);
const categoryBreakdown = computed(() => accountStore.categoryBreakdown);

const dateRanges = [
  { label: '近7天', value: 'week' },
  { label: '近30天', value: 'month' },
  { label: '近3月', value: 'quarter' }
];

const colorList = ['#FF6B6B', '#FF8E53', '#FFB88C', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#E74C3C'];

// 计算统计数据
const totalIncome = computed(() => {
  return trendData.value.reduce((sum, item) => sum + (item.income || 0), 0);
});

const totalExpense = computed(() => {
  return trendData.value.reduce((sum, item) => sum + (item.expense || 0), 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

const maxValue = computed(() => {
  const maxIncome = Math.max(...trendData.value.map(t => t.income || 0));
  const maxExpense = Math.max(...trendData.value.map(t => t.expense || 0));
  return Math.max(maxIncome, maxExpense, 100);
});

const avgIncome = computed(() => {
  const days = trendData.value.length || 1;
  return totalIncome.value / days;
});

const avgExpense = computed(() => {
  const days = trendData.value.length || 1;
  return totalExpense.value / days;
});

const incomeBreakdown = ref<any[]>([]);

// 获取日期范围
const getDateRange = (type: string) => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  let startDate = '';
  if (type === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (type === 'month') {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } else if (type === 'quarter') {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    startDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  
  return { startDate, endDate: today };
};

// 选择日期范围
const selectDateRange = (value: string) => {
  selectedRange.value = value;
  fetchData();
};

// 获取数据
const fetchData = async () => {
  const { startDate, endDate } = getDateRange(selectedRange.value);
  
  // 获取趋势数据
  await accountStore.fetchTrend(startDate, endDate, 'day');
  
  // 获取支出分类
  await accountStore.fetchCategoryBreakdown(startDate, endDate, 'expense');
  
  // 获取收入分类
  const incomeRes = await accountStore.fetchCategoryBreakdown(startDate, endDate, 'income');
  if (incomeRes.success) {
    incomeBreakdown.value = incomeRes.data || [];
  }
};

// 格式化金额
const formatAmount = (amount: number) => {
  return (amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化图表日期
const formatChartDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 格式化Y轴
const formatChartY = (value: number) => {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w';
  }
  return value.toFixed(0);
};

// 计算柱状图高度
const getBarHeight = (value: number) => {
  if (!value || !maxValue.value) return 4;
  const height = (value / maxValue.value) * 160;
  return Math.max(height, 4);
};

// 计算饼图样式
const getPieStyle = (percentage: number, index: number) => {
  const color = colorList[index % colorList.length];
  
  let rotate = 0;
  for (let i = 0; i < index; i++) {
    rotate += (categoryBreakdown.value[i]?.percentage || 0) * 3.6;
  }
  
  return {
    background: `conic-gradient(${color} 0% ${percentage}%, transparent ${percentage}% 100%)`,
    transform: `rotate(-${rotate}deg)`
  };
};

// 监听tab切换
watch(activeTab, () => {
  fetchData();
});

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.report-page {
  min-height: 100vh;
  background: #F7F8FA;
  padding-bottom: 40rpx;
}

/* 日期筛选 */
.date-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  padding: 24rpx;
}

.date-selector {
  display: flex;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  padding: 6rpx;
}

.date-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;

  &.active {
    background: #fff;
    color: #FF6B6B;
  }
}

/* 统计概览 */
.overview-card {
  background: #fff;
  margin: -20rpx 24rpx 24rpx;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.12);
}

.overview-header {
  margin-bottom: 20rpx;
}

.overview-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.overview-stats {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.stat-box {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: 16rpx;
  
  &.income {
    background: rgba(82, 196, 26, 0.08);
    .stat-icon { background: rgba(82, 196, 26, 0.15); color: #52C41A; }
    .stat-value { color: #52C41A; }
  }
  
  &.expense {
    background: rgba(255, 77, 79, 0.08);
    .stat-icon { background: rgba(255, 77, 79, 0.15); color: #FF4D4F; }
    .stat-value { color: #FF4D4F; }
  }
}

.stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  margin-top: 4rpx;
}

.overview-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  
  &.positive {
    background: rgba(82, 196, 26, 0.08);
    .balance-label { color: #52C41A; }
    .balance-value { color: #52C41A; }
  }
  
  &.negative {
    background: rgba(255, 77, 79, 0.08);
    .balance-label { color: #FF4D4F; }
    .balance-value { color: #FF4D4F; }
  }
}

.balance-label {
  font-size: 26rpx;
  font-weight: 500;
}

.balance-value {
  font-size: 36rpx;
  font-weight: 700;
}

/* Tab切换 */
.tab-bar {
  display: flex;
  background: #fff;
  margin: 0 24rpx;
  border-radius: 16rpx;
  padding: 8rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #999999;
  transition: all 0.2s ease;

  &.active {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.25);
  }
}

/* 通用区块 */
.section-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx 24rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.section-subtitle {
  font-size: 24rpx;
  color: #999999;
}

/* 趋势图 */
.chart-container {
  display: flex;
  padding: 20rpx 0;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 12rpx;
  font-size: 20rpx;
  color: #BBBBBB;
  text-align: right;
  min-width: 60rpx;
}

.chart-bars {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200rpx;
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bars-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 6rpx;
  height: 160rpx;
}

.bar {
  width: 20rpx;
  border-radius: 6rpx 6rpx 0 0;
  
  &.income { background: linear-gradient(180deg, #52C41A 0%, #73D13D 100%); }
  &.expense { background: linear-gradient(180deg, #FF4D4F 0%, #FF7875 100%); }
}

.bar-label {
  font-size: 20rpx;
  color: #999999;
  margin-top: 8rpx;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F2F5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666666;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
  
  &.income { background: #52C41A; }
  &.expense { background: #FF4D4F; }
}

/* 日均统计 */
.daily-stats {
  display: flex;
  gap: 20rpx;
}

.daily-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #F7F8FA;
  border-radius: 12rpx;
}

.daily-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
}

.daily-value {
  font-size: 32rpx;
  font-weight: 700;
  
  &.income { color: #52C41A; }
  &.expense { color: #FF4D4F; }
}

/* 分类占比 - 环形图 */
.pie-wrapper {
  position: relative;
  width: 280rpx;
  height: 280rpx;
  margin: 0 auto 30rpx;
}

.pie-chart {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #F7F8FA;
  position: relative;
  overflow: hidden;
}

.pie-segment {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-total-label {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.pie-total-value {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-top: 4rpx;
}

/* 分类列表 */
.category-list {
  margin-top: 20rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F8F8F8;

  &:last-child {
    border-bottom: none;
  }
}

.category-left {
  display: flex;
  align-items: center;
}

.category-index {
  width: 36rpx;
  height: 36rpx;
  border-radius: 8rpx;
  background: #F7F8FA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #999999;
  margin-right: 12rpx;
}

.category-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 6rpx;
  margin-right: 12rpx;
}

.category-name {
  font-size: 28rpx;
  color: #1A1A1A;
}

.category-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.category-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  
  &.income { color: #52C41A; }
}

.category-percent {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999999;
  font-size: 26rpx;
}
</style>
