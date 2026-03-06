<template>
  <view class="container">
    <view class="header">
      <text class="title">店账通</text>
      <text class="subtitle">中小店铺记账与库存管理</text>
    </view>
    <view class="content">
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <text class="feature-title">记账管理</text>
          <text class="feature-desc">快速记录日常收支</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📦</text>
          <text class="feature-title">库存管理</text>
          <text class="feature-desc">实时跟踪商品库存</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📈</text>
          <text class="feature-title">数据分析</text>
          <text class="feature-desc">经营数据可视化</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 店铺记账通 - 主应用组件
</script>

<style>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx;
}

.header {
  text-align: center;
  padding: 60rpx 0;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.content {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-top: 40rpx;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24rpx;
  background: #f8f9ff;
  border-radius: 16rpx;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.feature-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #666;
}
</style>
