<template>
  <view class="settings-page">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">通知设置</text>
      <view class="nav-placeholder"></view>
    </view>

    <view class="section">
      <view class="section-title">库存预警</view>
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">低库存提醒</text>
            <text class="menu-desc">商品库存低于阈值时提醒</text>
          </view>
          <switch 
            :checked="settings.lowStockAlert" 
            @change="toggleLowStockAlert"
            color="#007AFF"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">报告推送</view>
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">每日报告</text>
            <text class="menu-desc">每日推送收支汇总</text>
          </view>
          <switch 
            :checked="settings.dailyReport" 
            @change="toggleDailyReport"
            color="#007AFF"
          />
        </view>
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">月度报告</text>
            <text class="menu-desc">每月推送月度总结</text>
          </view>
          <switch 
            :checked="settings.monthlyReport" 
            @change="toggleMonthlyReport"
            color="#007AFF"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">提醒设置</view>
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">账单提醒</text>
            <text class="menu-desc">账单到期提醒</text>
          </view>
          <switch 
            :checked="settings.billReminder" 
            @change="toggleBillReminder"
            color="#007AFF"
          />
        </view>
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">推送时间</text>
            <text class="menu-desc">{{ settings.reportHour }}:00</text>
          </view>
          <picker 
            mode="time" 
            :value="reportTime" 
            @change="onTimeChange"
          >
            <text class="picker-text">选择时间 ></text>
          </picker>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">推送方式</view>
      <view class="menu-list">
        <view class="menu-item">
          <view class="menu-content">
            <text class="menu-label">通知渠道</text>
          </view>
          <picker 
            mode="selector" 
            :range="channelOptions" 
            :value="channelIndex"
            @change="onChannelChange"
          >
            <text class="picker-text">{{ channelOptions[channelIndex] }} ></text>
          </picker>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../api/api';

const authStore = useAuthStore();

const settings = ref({
  lowStockAlert: true,
  dailyReport: false,
  monthlyReport: false,
  billReminder: true,
  reportHour: 9,
  notificationChannel: 'wechat'
});

const channelOptions = ['微信', '短信', '邮件'];
const channelIndex = ref(0);

const reportTime = computed(() => {
  const hour = settings.value.reportHour.toString().padStart(2, '0');
  return `${hour}:00`;
});

// 返回上一页
const goBack = () => {
 }; uni.navigateBack();


// 加载设置
const loadSettings = async () => {
  try {
    const res = await api.get('/notifications/settings');
    if (res.data) {
      settings.value = { ...settings.value, ...res.data };
      channelIndex.value = channelOptions.findIndex(
        c => c === (settings.value.notificationChannel === 'wechat' ? '微信' : 
                   settings.value.notificationChannel === 'sms' ? '短信' : '邮件')
      );
    }
  } catch (error) {
    console.error('加载设置失败', error);
  }
};

// 保存设置
const saveSettings = async () => {
  try {
    const channelMap: Record<number, string> = { 0: 'wechat', 1: 'sms', 2: 'email' };
    await api.put('/notifications/settings', {
      ...settings.value,
      notificationChannel: channelMap[channelIndex.value]
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (error) {
    console.error('保存设置失败', error);
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
};

const toggleLowStockAlert = (e: any) => {
  settings.value.lowStockAlert = e.detail.value;
  saveSettings();
};

const toggleDailyReport = (e: any) => {
  settings.value.dailyReport = e.detail.value;
  saveSettings();
};

const toggleMonthlyReport = (e: any) => {
  settings.value.monthlyReport = e.detail.value;
  saveSettings();
};

const toggleBillReminder = (e: any) => {
  settings.value.billReminder = e.detail.value;
  saveSettings();
};

const onTimeChange = (e: any) => {
  const [hour] = e.detail.value.split(':');
  settings.value.reportHour = parseInt(hour);
  saveSettings();
};

const onChannelChange = (e: any) => {
  channelIndex.value = e.detail.value;
  saveSettings();
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    loadSettings();
  } else {
    uni.reLaunch({ url: '/pages/login/login' });
  }
});
</script>

<style lang="scss" scoped>
.settings-page {
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.nav-placeholder {
  width: 60rpx;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #fff;
  }
}

.section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  padding: 20rpx 30rpx;
}

.menu-list {
  background: #fff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-content {
  display: flex;
  flex-direction: column;
}

.menu-label {
  font-size: 30rpx;
  color: #333;
}

.menu-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #666;
}
</style>
