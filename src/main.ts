import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import App from './App.vue'
import './assets/index.less'
import router from './router'
// 额外引入图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import pinia from '@/stores'
const app = createApp(App)

app.use(router)
app.use(ArcoVue, {
  // 用于改变使用组件时的前缀名称
  componentPrefix: 'arco'
})
app.use(pinia)
app.use(ArcoVueIcon)
app.mount('#app')
