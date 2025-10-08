import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './style.css'

import App from './App.vue'
import router from './router'

// Создаем приложение ДО использования хранилищ
const app = createApp(App)
const pinia = createPinia()

// Устанавливаем плагины
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Регистрируем иконки
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Монтируем приложение
app.mount('#app')

// Инициализация после монтирования (неблокирующая)
const initializeApp = async () => {
  const { useAuthStore } = await import('./stores/auth')
  const { useNotificationsStore } = await import('./stores/notifications')
  const { webSocketService } = await import('./services/websocket')
  
  const authStore = useAuthStore()
  const notificationsStore = useNotificationsStore()
  
  try {
    if (authStore.token) {
      await authStore.getCurrentUser()
      
      if (authStore.isAuthenticated && authStore.user) {
        webSocketService.connect(authStore.token, authStore.user)
        await notificationsStore.initialize()
      }
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    if (authStore.isAuthenticated) {
      await authStore.logout()
    }
  }
}

// Запускаем инициализацию после рендера
setTimeout(initializeApp, 0)