<template>
  <view class="home">
    <!-- 顶部欢迎区 -->
    <view class="header">
      <view class="header-content">
        <view class="user-section">
          <view class="avatar">
            <text>{{ avatarText }}</text>
          </view>
          <view class="greeting">
            <text class="greeting-text">{{ greeting }}</text>
            <text class="username">{{ username }}</text>
          </view>
        </view>
        <view class="date-badge">
          <text class="date-text">{{ todayDate }}</text>
        </view>
      </view>
    </view>

    <!-- 今日收支卡片 -->
    <view class="today-card">
      <view class="card-header">
        <view class="card-icon">
          <text>📊</text>
        </view>
        <text class="card-title">今日收支</text>
      </view>
      <view class="today-stats">
        <view class="stat-item income">
          <view class="stat-icon income">
            <text>↑</text>
          </view>
          <view class="stat-info">
            <text class="stat-label">收入</text>
            <text class="stat-amount">+¥{{ formatAmount(quickStats?.todayIncome || 0) }}</text>
          </view>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item expense">
          <view class="stat-icon expense">
            <text>↓</text>
          </view>
          <view class="stat-info">
            <text class="stat-label">支出</text>
            <text class="stat-amount">-¥{{ formatAmount(quickStats?.todayExpense || 0) }}</text>
          </view>
        </view>
      </view>
      <view class="today-balance" :class="{ positive: todayBalance >= 0, negative: todayBalance < 0 }">
        <text class="balance-label">今日结余</text>
        <text class="balance-amount">{{ todayBalance >= 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(todayBalance)) }}</text>
      </view>
    </view>

    <!-- 周期统计 -->
    <view class="period-section">
      <text class="section-title">本周 vs 本月</text>
      <view class="period-grid">
        <view class="period-card">
          <view class="period-header">
            <text class="period-tag">本周</text>
          </view>
          <view class="period-stats">
            <view class="period-row">
              <text class="period-label">收入</text>
              <text class="period-amount income">+¥{{ formatAmount(quickStats?.weekIncome || 0) }}</text>
            </view>
            <view class="period-row">
              <text class="period-label">支出</text>
              <text class="period-amount expense">-¥{{ formatAmount(quickStats?.weekExpense || 0) }}</text>
            </view>
          </view>
        </view>
        <view class="period-card">
          <view class="period-header">
            <text class="period-tag">本月</text>
          </view>
          <view class="period-stats">
            <view class="period-row">
              <text class="period-label">收入</text>
              <text class="period-amount income">+¥{{ formatAmount(quickStats?.monthIncome || 0) }}</text>
            </view>
            <view class="period-row">
              <text class="period-label">支出</text>
              <text class="period-amount expense">-¥{{ formatAmount(quickStats?.monthExpense || 0) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <view class="action-btn primary" @click="goToAdd">
        <text class="action-icon">+</text>
        <text class="action-text">记一笔</text>
      </view>
      <view class="action-btn" @click="goToReport">
        <text class="action-icon">📈</text>
        <text class="action-text">看报表</text>
      </view>
      <view class="action-btn" @click="goToFlow">
        <text class="action-icon">📋</text>
        <text class="action-text">查流水</text>
      </view>
    </view>

    <!-- 最近流水 -->
    <view class="recent-section">
      <view class="section-header">
        <text class="section-title">最近记录</text>
        <view class="see-more" @click="goToFlow">
          <text>查看全部</text>
          <text class="arrow">›</text>
        </view>
      </view>
      
      <view v-if="recentAccounts.length > 0" class="flow-list">
        <view 
          v-for="item in recentAccounts" 
          :key="item.id" 
          class="flow-item"
          @click="editAccount(item)"
        >
          <view class="flow-left">
            <view :class="['type-badge', item.type]">
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
            <text class="flow-time">{{ formatTime(item.date) }}</text>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-state">
        <text class="empty-icon">💰</text>
        <text class="empty-text">暂无记账记录</text>
        <text class="empty-hint">点击"记一笔"开始记账吧</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useAccountStore } from '../../stores/account';

const authStore = useAuthStore();
const accountStore = useAccountStore();

const username = ref('用户');
const recentAccounts = ref<any[]>([]);

// 头像文字
const avatarText = computed(() => {
  const name = username.value;
  return name.charAt(0).toUpperCase();
});

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
});

// 今日日期
const todayDate = computed(() => {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
});

// 快捷统计
const quickStats = computed(() => accountStore.quickStats);

// 今日结余
const todayBalance = computed(() => {
  return (quickStats.value?.todayIncome || 0) - (quickStats.value?.todayExpense || 0);
});

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  if (dateStr === today) {
    return '今天';
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateStr === yesterdayStr) {
    return '昨天';
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 获取用户信息
const fetchUserInfo = async () => {
  const result = await authStore.getUserInfo();
  if (result.success && result.data) {
    username.value = result.data.username || '用户';
  }
};

// 获取统计数据
const fetchStats = async () => {
  await accountStore.fetchQuickStats();
};

// 获取最近流水
const fetchRecent = async () => {
  const result = await accountStore.fetchAccounts({ limit: 5 });
  if (result.success) {
    recentAccounts.value = result.data?.data || [];
  }
};

// 跳转到记一笔
const goToAdd = () => {
  uni.switchTab({ url: '/pages/add/add' });
};

// 跳转到流水
const goToFlow = () => {
  uni.switchTab({ url: '/pages/flow/flow' });
};

// 跳转到报表
const goToReport = () => {
  uni.switchTab({ url: '/pages/report/report' });
};

// 编辑账目
const editAccount = (item: any) => {
  uni.navigateTo({
    url: `/pages/add/add?id=${item.id}&type=${item.type}&amount=${item.amount}&categoryId=${item.categoryId}&description=${item.description}&date=${item.date}`
  });
};

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }
  await Promise.all([fetchUserInfo(), fetchStats(), fetchRecent()]);
});
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: #F7F8FA;
  padding-bottom: 40rpx;
}

/* 顶部欢迎区 */
.header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  padding: 60rpx 32rpx 80rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-section {
  display: flex;
  align-items: center;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  
  text {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
  }
}

.greeting {
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.username {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
  margin-top: 4rpx;
}

.date-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
}

.date-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

/* 今日收支卡片 */
.today-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin: -60rpx 24rpx 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.card-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  
  text {
    font-size: 28rpx;
  }
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.today-stats {
  display: flex;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #F0F2F5;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  
  &.income {
    .stat-icon {
      background: rgba(82, 196, 26, 0.1);
      color: #52C41A;
    }
    .stat-amount {
      color: #52C41A;
    }
  }
  
  &.expense {
    .stat-icon {
      background: rgba(255, 77, 79, 0.1);
      color: #FF4D4F;
    }
    .stat-amount {
      color: #FF4D4F;
    }
  }
}

.stat-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  
  text {
    font-size: 28rpx;
    font-weight: 700;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-amount {
  font-size: 36rpx;
  font-weight: 700;
  margin-top: 4rpx;
}

.stat-divider {
  width: 1rpx;
  height: 64rpx;
  background: #F0F2F5;
}

.today-balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  
  &.positive {
    background: rgba(82, 196, 26, 0.08);
    .balance-label { color: #52C41A; }
    .balance-amount { color: #52C41A; }
  }
  
  &.negative {
    background: rgba(255, 77, 79, 0.08);
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

/* 周期统计 */
.period-section {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16rpx;
}

.period-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.period-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.period-header {
  margin-bottom: 16rpx;
}

.period-tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
}

.period-stats {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.period-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-label {
  font-size: 24rpx;
  color: #999999;
}

.period-amount {
  font-size: 28rpx;
  font-weight: 600;
  
  &.income { color: #52C41A; }
  &.expense { color: #FF4D4F; }
}

/* 快捷操作 */
.quick-actions {
  display: flex;
  padding: 0 24rpx;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.action-btn {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.97);
  }
  
  &.primary {
    background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.25);
    
    .action-text { color: #fff; }
  }
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.action-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #666666;
}

/* 最近流水 */
.recent-section {
  padding: 0 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.see-more {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #FF6B6B;
  
  .arrow {
    font-size: 32rpx;
    margin-left: 4rpx;
  }
}

.flow-list {
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

.type-badge {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  
  text {
    font-size: 24rpx;
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
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.flow-amount {
  font-size: 32rpx;
  font-weight: 700;
  
  &.income { color: #52C41A; }
  &.expense { color: #FF4D4F; }
}

.flow-time {
  font-size: 22rpx;
  color: #BBBBBB;
  margin-top: 4rpx;
}

/* 空状态 */
.empty-state {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #666666;
}

.empty-hint {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
</style>
