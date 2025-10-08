<template>
  <div id="app">
    <!-- Для авторизованных пользователей показываем полный layout -->
    <div v-if="authStore.isAuthenticated" class="authenticated-layout">
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
import { onMounted } from 'vue'
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

    // При загрузке приложения проверяем авторизацию
    onMounted(async () => {
      if (authStore.token) {
        try {
          await authStore.getCurrentUser()
        } catch (error) {
          // Если токен невалидный, разлогиниваем пользователя
          await authStore.logout()
        }
      }
    })

    return {
      authStore
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

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.authenticated-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
}
</style>