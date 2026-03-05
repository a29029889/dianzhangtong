<template>
  <view class="home">
    <!-- 顶部欢迎 -->
    <view class="header">
      <view class="welcome">
        <text class="greeting">{{ greeting }}，{{ username }}</text>
        <text class="date">{{ todayDate }}</text>
      </view>
    </view>

    <!-- 今日收支概览 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">今日收支</text>
      </view>
      <view class="stats-content">
        <view class="stat-item income">
          <text class="label">收入</text>
          <text class="amount">+¥{{ formatAmount(quickStats?.todayIncome || 0) }}</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item expense">
          <text class="label">支出</text>
          <text class="amount">-¥{{ formatAmount(quickStats?.todayExpense || 0) }}</text>
        </view>
      </view>
    </view>

    <!-- 本周/本月统计 -->
    <view class="period-stats">
      <view class="period-card">
        <text class="period-label">本周收入</text>
        <text class="period-amount income">+¥{{ formatAmount(quickStats?.weekIncome || 0) }}</text>
      </view>
      <view class="period-card">
        <text class="period-label">本周支出</text>
        <text class="period-amount expense">-¥{{ formatAmount(quickStats?.weekExpense || 0) }}</text>
      </view>
      <view class="period-card">
        <text class="period-label">本月收入</text>
        <text class="period-amount income">+¥{{ formatAmount(quickStats?.monthIncome || 0) }}</text>
      </view>
      <view class="period-card">
        <text class="period-label">本月支出</text>
        <text class="period-amount expense">-¥{{ formatAmount(quickStats?.monthExpense || 0) }}</text>
      </view>
    </view>

    <!-- 快捷记一笔按钮 -->
    <view class="quick-add" @click="goToAdd">
      <text class="quick-add-text">+ 记一笔</text>
    </view>

    <!-- 最近流水预览 -->
    <view class="recent-flow">
      <view class="section-header">
        <text class="section-title">最近流水</text>
        <text class="see-more" @click="goToFlow">查看全部 ></text>
      </view>
      <view v-if="recentAccounts.length > 0" class="flow-list">
        <view 
          v-for="item in recentAccounts" 
          :key="item.id" 
          class="flow-item"
          @click="editAccount(item)"
        >
          <view class="flow-info">
            <text class="flow-category">{{ item.categoryName || '未分类' }}</text>
            <text class="flow-desc">{{ item.description || '-' }}</text>
          </view>
          <text :class="['flow-amount', item.type]">
            {{ item.type === 'income' ? '+' : '-' }}¥{{ formatAmount(item.amount) }}
          </text>
        </view>
      </view>
      <view v-else class="empty">
        <text>暂无记录</text>
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

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 12) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// 今日日期
const todayDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
});

// 快捷统计
const quickStats = computed(() => accountStore.quickStats);

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
  background: #f5f5f5;
  padding: 0 30rpx;
}

.header {
  padding: 40rpx 0;
}

.welcome {
  display: flex;
  flex-direction: column;
}

.greeting {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.date {
  font-size: 26rpx;
  color: #999;
  margin-top: 10rpx;
}

.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.stats-header {
  margin-bottom: 20rpx;
}

.stats-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  .label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 26rpx;
    margin-bottom: 10rpx;
  }

  .amount {
    color: #fff;
    font-size: 40rpx;
    font-weight: bold;
  }
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
}

.period-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.period-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.period-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.period-amount {
  font-size: 32rpx;
  font-weight: bold;

  &.income {
    color: #52c41a;
  }

  &.expense {
    color: #ff4d4f;
  }
}

.quick-add {
  background: #007AFF;
  border-radius: 50rpx;
  padding: 26rpx;
  text-align: center;
  margin-bottom: 30rpx;
}

.quick-add-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
}

.recent-flow {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.see-more {
  font-size: 26rpx;
  color: #007AFF;
}

.flow-list {
  max-height: 500rpx;
  overflow-y: auto;
}

.flow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.flow-info {
  display: flex;
  flex-direction: column;
}

.flow-category {
  font-size: 28rpx;
  color: #333;
}

.flow-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.flow-amount {
  font-size: 30rpx;
  font-weight: bold;

  &.income {
    color: #52c41a;
  }

  &.expense {
    color: #ff4d4f;
  }
}

.empty {
  text-align: center;
  padding: 40rpx;
  color: #999;
}
</style>
