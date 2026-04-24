import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './store'
import router from './router'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import './assets/styles/global.scss'

// Import all Element Plus icons
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// Register all icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// Load user info
app.config.globalProperties.$userId = localStorage.getItem('userId') || 'dev-user-001'

app.mount('#app')
