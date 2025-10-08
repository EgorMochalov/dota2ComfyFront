import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './style.css'

import App from './App.vue'
import router from './router'
import { webSocketService } from './services/websocket'
import { useAuthStore } from './stores/auth'
import { useNotificationsStore } from './stores/notifications'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Инициализация приложения
const initializeApp = async () => {
  const authStore = useAuthStore()
  const notificationsStore = useNotificationsStore()
  
  try {
    // Проверяем наличие токена и загружаем пользователя
    if (authStore.token) {
      await authStore.getCurrentUser()
      
      // Инициализируем WebSocket если пользователь авторизован
      if (authStore.isAuthenticated && authStore.user) {
        webSocketService.connect(authStore.token, authStore.user)
        await notificationsStore.initialize()
      }
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Если произошла ошибка при инициализации, разлогиниваем пользователя
    if (authStore.isAuthenticated) {
      await authStore.logout()
    }
  } finally {
    app.mount('#app')
  }
}

initializeApp()