<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <div class="logo-icon">
            <el-icon size="28"><Star /></el-icon>
          </div>
          <div class="logo-text">
            <h1>Dota 2 Finder</h1>
            <span class="logo-subtitle">Find Your Team</span>
          </div>
        </router-link>
      </div>

      <div class="user-menu" v-if="authStore.isAuthenticated">
        <NotificationBell />
        
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar 
              :size="40" 
              :src="authStore.user?.avatar_url" 
              class="user-avatar"
            />
            <div class="user-details">
              <span class="username">{{ authStore.user?.username }}</span>
              <span class="user-status">
                <el-tag v-if="authStore.user?.team_id" size="small" type="success">
                  В команде
                </el-tag>
                <el-tag v-else size="small" type="info">
                  Без команды
                </el-tag>
              </span>
            </div>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
          </div>
          
          <template #dropdown>
            <el-dropdown-menu class="user-dropdown-menu">
              <el-dropdown-item @click="$router.push('/profile')" class="dropdown-item">
                <el-icon><User /></el-icon>
                <span>Профиль</span>
              </el-dropdown-item>
              
              <el-dropdown-item 
                @click="$router.push('/my-team')" 
                class="dropdown-item"
                v-if="authStore.user?.team_id"
              >
                <el-icon><Mouse /></el-icon>
                <span>Моя команда</span>
              </el-dropdown-item>
              
              <el-dropdown-item @click="$router.push('/notifications')" class="dropdown-item">
                <el-icon><Bell /></el-icon>
                <span>Уведомления</span>
                <el-badge v-if="notificationsStore.unreadCount > 0" :value="notificationsStore.unreadCount" />
              </el-dropdown-item>
              
              <el-dropdown-item divided @click="handleLogout" class="dropdown-item logout">
                <el-icon><SwitchButton /></el-icon>
                <span>Выйти</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="auth-buttons" v-else>
        <router-link to="/login">
          <el-button type="primary" class="auth-button">
            Войти
          </el-button>
        </router-link>
        <router-link to="/register">
          <el-button class="auth-button secondary">
            Регистрация
          </el-button>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import NotificationBell from './NotificationBell.vue'
import {
  User,
  Document,
  Message,
  Bell,
  SwitchButton,
  ArrowDown,
  Star,
  ChatDotRound,
  Mouse
} from '@element-plus/icons-vue'

export default {
  name: 'Header',
  components: {
    NotificationBell,
    User,
    Mouse,
    Document,
    Message,
    Bell,
    SwitchButton,
    ArrowDown,
    Star,
    ChatDotRound
  },
  setup() {
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()

    const handleLogout = async () => {
      await authStore.logout()
      window.location.href = '/login'
    }

    return {
      authStore,
      notificationsStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 0;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1000;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  height: 70px;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  transition: transform var(--transition-normal);
}

.logo-link:hover {
  transform: translateY(-1px);
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-text h1 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  gap: 8px;
  margin-left: 40px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-sm);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
}

.user-status {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-top: 5px;
}

.dropdown-arrow {
  transition: transform var(--transition-fast);
  opacity: 0.7;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  border: none;
  box-shadow: var(--shadow-xl);
  border-radius: var(--border-radius);
  padding: 8px;
  background: var(--bg-card);
}

:deep(.dropdown-item) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: all var(--transition-fast);
  font-weight: 500;
}

:deep(.dropdown-item:hover) {
  background: var(--primary-color);
  color: white;
}

:deep(.dropdown-item.logout:hover) {
  background: var(--danger-gradient);
  color: white;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.auth-button {
  padding: 10px 24px;
  font-weight: 600;
  border-radius: var(--border-radius);
}

.auth-button.secondary {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.auth-button.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
  }
  
  .logo-text h1 {
    font-size: 1.2rem;
  }
  
  .logo-subtitle {
    display: none;
  }
  
  .nav {
    margin-left: 20px;
    gap: 4px;
  }
  
  .nav-link {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .nav-link span {
    display: none;
  }
  
  .user-details {
    display: none;
  }
  
  .dropdown-arrow {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav {
    display: none;
  }
  
  .auth-buttons {
    gap: 8px;
  }
  
  .auth-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
</style>