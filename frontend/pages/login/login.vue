<template>
  <view class="login-page">
    <view class="logo">
      <text class="logo-text">店账通</text>
      <text class="logo-subtitle">中小店铺记账与库存管理</text>
    </view>

    <view class="form">
      <view class="input-group">
        <input 
          class="input" 
          v-model="form.username" 
          placeholder="用户名" 
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          v-model="form.password" 
          type="password" 
          placeholder="密码" 
        />
      </view>
      
      <view class="btn" @click="handleLogin">
        <text>登录</text>
      </view>
      
      <view class="btn secondary" @click="isRegister = !isRegister">
        <text>{{ isRegister ? '已有账号？去登录' : '没有账号？去注册' }}</text>
      </view>
      
      <view v-if="isRegister" class="input-group">
        <input 
          class="input" 
          v-model="form.confirmPassword" 
          type="password" 
          placeholder="确认密码" 
        />
      </view>
      
      <view v-if="isRegister" class="btn" @click="handleRegister">
        <text>注册</text>
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
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60rpx;
}

.logo {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo-text {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #fff;
}

.logo-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 16rpx;
}

.form {
  background: #fff;
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.btn {
  background: #007AFF;
  border-radius: 50rpx;
  padding: 26rpx;
  text-align: center;
  margin-top: 20rpx;

  text {
    color: #fff;
    font-size: 32rpx;
    font-weight: bold;
  }

  &.secondary {
    background: transparent;
    border: 2rpx solid #007AFF;

    text {
      color: #007AFF;
    }
  }
}
</style>
