import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
// 全局注册 uni-popup 组件
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  // 全局注册 uni-popup 组件
  app.component('uni-popup', uniPopup)
  return {
    app
  }
}
