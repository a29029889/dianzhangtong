<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-wrapper">
        <text class="logo-icon">💰</text>
      </view>
      <text class="logo-text">店账通</text>
      <text class="logo-slogan">中小店铺记账与库存管理</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="form-card">
        <view class="tab-switch">
          <view 
            :class="['tab-item', { active: !isRegister }]" 
            @click="switchToLogin"
          >
            <text>登录</text>
          </view>
          <view 
            :class="['tab-item', { active: isRegister }]" 
            @click="switchToRegister"
          >
            <text>注册</text>
          </view>
        </view>

        <view class="form-content">
          <view class="input-wrapper">
            <text class="input-icon">👤</text>
            <input 
              class="input" 
              v-model="form.username" 
              placeholder="请输入用户名"
              maxlength="20"
            />
          </view>
          
          <view class="input-wrapper">
            <text class="input-icon">🔒</text>
            <input 
              class="input" 
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码"
              maxlength="20"
            />
          </view>
          
          <view v-if="isRegister" class="input-wrapper">
            <text class="input-icon">🔐</text>
            <input 
              class="input" 
              v-model="form.confirmPassword" 
              type="password" 
              placeholder="请再次输入密码"
              maxlength="20"
            />
          </view>

          <view class="submit-btn" @click="handleSubmit">
            <text>{{ isRegister ? '注册' : '登录' }}</text>
          </view>

          <view v-if="!isRegister" class="tips">
            <text>还没有账号？</text>
            <text class="link" @click="switchToRegister">立即注册</text>
          </view>
          
          <view v-else class="tips">
            <text>已有账号？</text>
            <text class="link" @click="switchToLogin">立即登录</text>
          </view>
        </view>
      </view>

      <!-- 底部说明 -->
      <view class="footer-tips">
        <text class="footer-text">登录即表示同意</text>
        <text class="link">《用户协议》</text>
        <text class="footer-text">和</text>
        <text class="link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const isRegister = ref(false);
const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

const switchToLogin = () => {
  isRegister.value = false;
  form.value.password = '';
  form.value.confirmPassword = '';
};

const switchToRegister = () => {
  isRegister.value = true;
  form.value.password = '';
  form.value.confirmPassword = '';
};

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '登录中...' });
  
  const result = await authStore.login(form.value.username, form.value.password);
  
  uni.hideLoading();
  
  if (result.success) {
    uni.showToast({ title: '登录成功', icon: 'success' });
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/home' });
    }, 1000);
  } else {
    uni.showToast({ title: result.message || '登录失败', icon: 'none' });
  }
};

const handleRegister = async () => {
  if (!form.value.username || !form.value.password) {
    uni.showToast({ title: '请输入用户名和密码', icon: 'none' });
    return;
  }
  
  if (form.value.password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' });
    return;
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: '两次密码不一致', icon: 'none' });
    return;
  }

  uni.showLoading({ title: '注册中...' });
  
  const result = await authStore.register(form.value.username, form.value.password);
  
  uni.hideLoading();
  
  if (result.success) {
    uni.showToast({ title: '注册成功，请登录', icon: 'success' });
    isRegister.value = false;
    form.value.password = '';
    form.value.confirmPassword = '';
  } else {
    uni.showToast({ title: result.message || '注册失败', icon: 'none' });
  }
};

const handleSubmit = () => {
  if (isRegister.value) {
    handleRegister();
  } else {
    handleLogin();
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #FF6B6B 0%, #FF8E53 50%, #FFB88C 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  
  &.circle-1 {
    width: 600rpx;
    height: 600rpx;
    background: #fff;
    top: -200rpx;
    right: -200rpx;
  }
  
  &.circle-2 {
    width: 400rpx;
    height: 400rpx;
    background: #fff;
    bottom: 100rpx;
    left: -150rpx;
  }
  
  &.circle-3 {
    width: 200rpx;
    height: 200rpx;
    background: #fff;
    top: 40%;
    right: 10%;
  }
}

/* Logo区域 */
.logo-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
  padding-bottom: 60rpx;
}

.logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  background: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
  margin-bottom: 24rpx;
}

.logo-icon {
  font-size: 80rpx;
}

.logo-text {
  font-size: 52rpx;
  font-weight: 800;
  color: #fff;
  letter-spacing: 4rpx;
}

.logo-slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 12rpx;
}

/* 表单区域 */
.form-section {
  position: relative;
  z-index: 1;
  padding: 0 32rpx;
}

.form-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 8rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.1);
}

.tab-switch {
  display: flex;
  padding: 8rpx;
  margin: 8rpx;
  background: #F7F8FA;
  border-radius: 24rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #999999;
  transition: all 0.25s ease;
  
  &.active {
    background: #fff;
    color: #FF6B6B;
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.15);
  }
}

.form-content {
  padding: 32rpx 24rpx;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #F7F8FA;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 20rpx;
  transition: all 0.2s ease;
  
  &:focus-within {
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(255, 107, 107, 0.15);
  }
}

.input-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.input {
  flex: 1;
  height: 96rpx;
  font-size: 28rpx;
  color: #1A1A1A;
}

.submit-btn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  border-radius: 24rpx;
  padding: 28rpx;
  text-align: center;
  margin-top: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
  }

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: 700;
  }
}

.tips {
  text-align: center;
  margin-top: 24rpx;
  font-size: 26rpx;
  color: #999999;
}

.link {
  color: #FF6B6B;
  font-weight: 600;
  margin-left: 8rpx;
}

/* 底部说明 */
.footer-tips {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 40rpx 0;
}

.footer-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.footer-tips .link {
  color: #fff;
  font-weight: 500;
  text-decoration: underline;
}
</style>
