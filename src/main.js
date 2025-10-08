import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'

import App from './App.vue'
import router from './router'
import { registerElementPlus } from './components/global'
import { registerIcons } from './utils/icons'

const app = createApp(App)
const pinia = createPinia()

// Регистрируем Element Plus компоненты
app.use(ElementPlus)
registerElementPlus(app)

// Регистрируем иконки
registerIcons(app)

app.use(pinia)
app.use(router)

// Инициализация приложения
const initializeApp = async () => {
  try {
    const { useAuthStore } = await import('./stores/auth')
    const { useNotificationsStore } = await import('./stores/notifications')
    const { webSocketService } = await import('./services/websocket')
    
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()
    
    if (authStore.token) {
      try {
        await authStore.getCurrentUser()
        
        if (authStore.isAuthenticated && authStore.user) {
          webSocketService.connect(authStore.token, authStore.user)
          await notificationsStore.initialize()
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
        if (authStore.isAuthenticated) {
          await authStore.logout()
        }
      }
    }
  } catch (error) {
    console.error('Failed to load stores:', error)
  }
}

initializeApp().catch(console.error)

// Монтируем приложение сразу, а инициализацию делаем асинхронно
app.mount('#app')