<template>
  <div id="app">
    <!-- Состояние загрузки -->
    <div v-if="appLoading" class="app-loading">
      <div class="loading-spinner">
        <!-- Ваш лоадер здесь -->
        <p>Загрузка...</p>
      </div>
    </div>

    <!-- Для авторизованных пользователей показываем полный layout -->
    <div v-else-if="authStore.isAuthenticated" class="authenticated-layout">
      <Header />
      <div class="main-container">
        <Sidebar />
        <main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
      <Footer />
    </div>
    
    <!-- Для неавторизованных показываем только router-view -->
    <div v-else class="auth-layout">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import Header from './components/Layout/Header.vue'
import Sidebar from './components/Layout/Sidebar.vue'
import Footer from './components/Layout/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Sidebar,
    Footer
  },
  setup() {
    const authStore = useAuthStore()
    const appLoading = ref(true)

    // При загрузке приложения проверяем авторизацию
    onMounted(async () => {
      try {
        if (authStore.token) {
          await authStore.getCurrentUser()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Если токен невалидный, разлогиниваем пользователя
        await authStore.logout()
      } finally {
        // Всегда скрываем лоадер после проверки
        appLoading.value = false
      }
    })

    return {
      authStore,
      appLoading
    }
  }
}
</script>

<style>
/* Анимации страниц */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.authenticated-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  animation: layout-fade-in 0.3s ease;
}

.main-container {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 120px);
}

.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: layout-fade-in 0.3s ease;
}

/* Лоадер приложения */
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner p {
  margin-top: 10px;
  color: #666;
}

/* Анимация появления layout */
@keyframes layout-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Убедитесь, что скрыты элементы при переключении */
.authenticated-layout,
.auth-layout {
  width: 100%;
}
</style>