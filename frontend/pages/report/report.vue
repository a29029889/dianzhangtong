<template>
  <view class="report-page">
    <!-- 顶部tab切换 -->
    <view class="tab-bar">
      <view 
        :class="['tab-item', { active: activeTab === 'trend' }]" 
        @click="activeTab = 'trend'"
      >
        趋势
      </view>
      <view 
        :class="['tab-item', { active: activeTab === 'breakdown' }]" 
        @click="activeTab = 'breakdown'"
      >
        分类
      </view>
    </view>

    <!-- 日期筛选 -->
    <view class="date-filter">
      <view 
        v-for="range in dateRanges" 
        :key="range.value" 
        :class="['date-btn', { active: selectedRange === range.value }]"
        @click="selectDateRange(range.value)"
      >
        {{ range.label }}
      </view>
    </view>

    <!-- 趋势图 -->
    <view v-if="activeTab === 'trend'" class="trend-section">
      <view class="section-title">
        <text>收支趋势</text>
      </view>
      
      <!-- 统计概览 -->
      <view class="trend-stats">
        <view class="trend-stat">
          <text class="label">总收入</text>
          <text class="value income">+¥{{ formatAmount(totalIncome) }}</text>
        </view>
        <view class="trend-stat">
          <text class="label">总支出</text>
          <text class="value expense">-¥{{ formatAmount(totalExpense) }}</text>
        </view>
        <view class="trend-stat">
          <text class="label">结余</text>
          <text :class="['value', balance >= 0 ? 'income' : 'expense']">
            {{ balance >= 0 ? '+' : '-' }}¥{{ formatAmount(Math.abs(balance)) }}
          </text>
        </view>
      </view>

      <!-- 趋势图表 -->
      <view class="chart-container">
        <view class="chart-canvas">
          <view 
            v-for="(item, index) in trendData" 
            :key="index"
            class="chart-bar-group"
          >
            <view class="bars">
              <view 
                class="bar income"
                :style="{ height: getBarHeight(item.income, maxIncome) + 'rpx' }"
              ></view>
              <view 
                class="bar expense"
                :style="{ height: getBarHeight(item.expense, maxExpense) + 'rpx' }"
              ></view>
            </view>
            <text class="bar-label">{{ formatChartDate(item.date) }}</text>
          </view>
        </view>
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-color income"></view>
            <text>收入</text>
          </view>
          <view class="legend-item">
            <view class="legend-color expense"></view>
            <text>支出</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 分类占比 -->
    <view v-if="activeTab === 'breakdown'" class="breakdown-section">
      <view class="section-title">
        <text>支出分类</text>
      </view>

      <!-- 饼图 -->
      <view class="pie-container">
        <view class="pie-chart">
          <view 
            v-for="(item, index) in categoryBreakdown" 
            :key="index"
            class="pie-segment"
            :style="getPieStyle(item.percentage, index)"
          ></view>
        </view>
        <view class="pie-center">
          <text class="total-label">总支出</text>
          <text class="total-amount">¥{{ formatAmount(totalExpense) }}</text>
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
            <view class="category-color" :style="{ background: colorList[index % colorList.length] }"></view>
            <text class="category-name">{{ item.categoryName }}</text>
          </view>
          <view class="category-right">
            <text class="category-amount">¥{{ formatAmount(item.amount) }}</text>
            <text class="category-percent">{{ item.percentage.toFixed(1) }}%</text>
          </view>
        </view>
      </view>

      <!-- 收入分类 -->
      <view class="section-title income-title">
        <text>收入分类</text>
      </view>

      <view class="category-list">
        <view 
          v-for="(item, index) in incomeBreakdown" 
          :key="'income-' + index"
          class="category-item"
        >
          <view class="category-left">
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

const colorList = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

// 计算统计数据
const totalIncome = computed(() => {
  return trendData.value.reduce((sum, item) => sum + (item.income || 0), 0);
});

const totalExpense = computed(() => {
  return trendData.value.reduce((sum, item) => sum + (item.expense || 0), 0);
});

const balance = computed(() => totalIncome.value - totalExpense.value);

const maxIncome = computed(() => {
  const max = Math.max(...trendData.value.map(t => t.income || 0));
  return max || 100;
});

const maxExpense = computed(() => {
  const max = Math.max(...trendData.value.map(t => t.expense || 0));
  return max || 100;
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

// 计算柱状图高度
const getBarHeight = (value: number, max: number) => {
  if (!value || !max) return 0;
  const height = (value / max) * 120;
  return Math.max(height, 4);
};

// 计算饼图样式
const getPieStyle = (percentage: number, index: number) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const color = colors[index % colors.length];
  
  // 计算旋转角度和占比
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
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 30rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;

  &.active {
    color: #007AFF;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #007AFF;
      border-radius: 3rpx;
    }
  }
}

.date-filter {
  display: flex;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.date-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #007AFF;
    color: #fff;
  }
}

.section-title {
  padding: 20rpx 30rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.trend-stats {
  display: flex;
  background: #fff;
  padding: 30rpx;
  margin: 0 30rpx 30rpx;
  border-radius: 12rpx;
}

.trend-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 10rpx;
  }

  .value {
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

.chart-container {
  background: #fff;
  margin: 0 30rpx;
  border-radius: 12rpx;
  padding: 30rpx;
}

.chart-canvas {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 240rpx;
  padding-bottom: 20rpx;
}

.chart-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bars {
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  height: 180rpx;
}

.bar {
  width: 24rpx;
  border-radius: 4rpx 4rpx 0 0;

  &.income {
    background: #52c41a;
  }

  &.expense {
    background: #ff4d4f;
  }
}

.bar-label {
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}

.legend-color {
  width: 20rpx;
  height: 20rpx;
  border-radius: 4rpx;
  margin-right: 10rpx;

  &.income {
    background: #52c41a;
  }

  &.expense {
    background: #ff4d4f;
  }
}

.pie-container {
  position: relative;
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 12rpx;
  padding: 40rpx;
}

.pie-chart {
  width: 300rpx;
  height: 300rpx;
  margin: 0 auto;
  border-radius: 50%;
  background: #f5f5f5;
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

.total-label {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.total-amount {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-top: 10rpx;
}

.category-list {
  background: #fff;
  margin: 0 30rpx;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 10rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.category-left {
  display: flex;
  align-items: center;
}

.category-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
  margin-right: 16rpx;
}

.category-name {
  font-size: 28rpx;
  color: #333;
}

.category-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.category-amount {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;

  &.income {
    color: #52c41a;
  }
}

.category-percent {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.income-title {
  margin-top: 30rpx;
}
</style>
