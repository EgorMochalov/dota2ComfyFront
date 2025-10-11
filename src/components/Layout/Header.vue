<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <!-- Кнопка меню для мобильных -->
        <div class="menu-toggle" @click="$emit('toggle-sidebar')" v-if="authStore.isAuthenticated">
          <el-icon><Menu /></el-icon>
        </div>
        
        <div class="logo">
          <router-link to="/" class="logo-link">
            <div class="logo-icon">
              <el-icon size="28"><Star /></el-icon>
            </div>
            <div class="logo-text">
              <h1 class="logo-title">Dota 2 Finder</h1>
              <span class="logo-subtitle">Find Your Team</span>
            </div>
          </router-link>
        </div>
      </div>

      <div class="user-menu" v-if="authStore.isAuthenticated">
        <!-- Уведомления - скрываем на очень маленьких экранах -->
        <NotificationBell class="notification-bell" />
        
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar 
              :size="getAvatarSize" 
              :src="authStore.user?.avatar_url ? authStore.user.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" 
              class="user-avatar"
            />
            <div class="user-details">
              <span class="username">{{ authStore.user?.username }}</span>
              <span class="user-status">
                <el-tag v-if="authStore.user?.team_id" size="small" type="success" class="status-tag">
                  В команде
                </el-tag>
                <el-tag v-else size="small" type="info" class="status-tag">
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
          <el-button type="primary" class="auth-button login-btn">
            <span class="btn-text">Войти</span>
            <el-icon class="btn-icon"><User /></el-icon>
          </el-button>
        </router-link>
        <router-link to="/register">
          <el-button class="auth-button secondary register-btn">
            <span class="btn-text">Регистрация</span>
            <el-icon class="btn-icon"><Edit /></el-icon>
          </el-button>
        </router-link>
      </div>
    </div>
  </header>
</template>

<script>
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'
import { computed } from 'vue'
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
  Mouse,
  Menu,
  Edit
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
    ChatDotRound,
    Menu,
    Edit
  },
  emits: ['toggle-sidebar'],
  setup() {
    const authStore = useAuthStore()
    const notificationsStore = useNotificationsStore()

    const getAvatarSize = computed(() => {
      const width = window.innerWidth
      if (width < 480) return 32
      if (width < 768) return 36
      return 40
    })

    const handleLogout = async () => {
      await authStore.logout()
      window.location.href = '/login'
    }

    return {
      authStore,
      notificationsStore,
      getAvatarSize,
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
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  height: 70px;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  display: none;
  cursor: pointer;
  padding: 8px;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
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
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.7rem;
  opacity: 0.8;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-bell {
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}

.user-status {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-top: 2px;
}

.status-tag {
  font-size: 0.6rem;
  padding: 2px 6px;
  height: auto;
}

.dropdown-arrow {
  transition: transform var(--transition-fast);
  opacity: 0.7;
  flex-shrink: 0;
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
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-text {
  transition: opacity var(--transition-normal);
}

.btn-icon {
  display: none;
  transition: transform var(--transition-normal);
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

/* ===== АДАПТИВНОСТЬ ===== */

/* Планшеты и маленькие ноутбуки (1024px - 768px) */
@media (max-width: 1024px) {
  .header-container {
    padding: 0 20px;
  }
  
  .logo-title {
    font-size: 1.3rem;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .user-info {
    padding: 6px 14px;
    gap: 10px;
  }
  
  .auth-button {
    padding: 9px 20px;
  }
}

/* Планшеты (768px и меньше) */
@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 60px;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .logo-title {
    font-size: 1.2rem;
  }
  
  .logo-subtitle {
    display: none;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  
  .user-details {
    display: none;
  }
  
  .dropdown-arrow {
    display: none;
  }
  
  .user-info {
    padding: 6px 12px;
    gap: 8px;
  }
  
  .auth-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
  
  .user-menu {
    gap: 12px;
  }
}

/* Большие мобильные (600px - 480px) */
@media (max-width: 600px) {
  .header-container {
    padding: 0 14px;
  }
  
  .logo-title {
    font-size: 1.1rem;
  }
  
  .logo-icon {
    width: 34px;
    height: 34px;
  }
  
  .logo-link {
    gap: 10px;
  }
  
  .auth-button {
    padding: 8px 14px;
  }
  
  .btn-text {
    display: block;
  }
  
  .btn-icon {
    display: none;
  }
}

/* Средние мобильные (480px - 400px) */
@media (max-width: 480px) {
  .header-container {
    padding: 0 12px;
    height: 56px;
  }
  
  .logo-title {
    font-size: 1rem;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .menu-toggle {
    padding: 6px;
  }
  
  .user-info {
    padding: 5px 10px;
  }
  
  .auth-buttons {
    gap: 8px;
  }
  
  .auth-button {
    padding: 7px 12px;
    font-size: 0.85rem;
  }
  
  .notification-bell {
    transform: scale(0.9);
  }
}

/* Маленькие мобильные (400px - 360px) */
@media (max-width: 400px) {
  .header-container {
    padding: 0 10px;
  }
  
  .logo-title {
    font-size: 0.9rem;
  }
  
  .logo {
    display: none;
  }
  
  .logo-link {
    gap: 0;
  }
  
  .auth-buttons {
    gap: 6px;
  }
  
  .auth-button {
    padding: 6px 10px;
    min-width: auto;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    display: block;
    font-size: 1.1rem;
  }
  
  .user-info {
    padding: 4px 8px;
  }
  
  .notification-bell {
    transform: scale(0.85);
  }
}

/* Очень маленькие мобильные (360px и меньше) */
@media (max-width: 360px) {
  .header-container {
    padding: 0 8px;
  }
  
  .logo-icon {
    width: 30px;
    height: 30px;
  }
  
  .menu-toggle {
    padding: 5px;
  }
  
  .user-menu {
    gap: 8px;
  }
  
  .auth-button {
    padding: 5px 8px;
  }
  
  .btn-icon {
    font-size: 1rem;
  }
  
  .notification-bell {
    transform: scale(0.8);
  }
  
  .user-info {
    padding: 4px 6px;
  }
}

/* Ландшафтная ориентация для мобильных */
@media (max-height: 500px) and (max-width: 900px) {
  .header-container {
    height: 50px;
  }
  
  .logo-icon {
    width: 30px;
    height: 30px;
  }
  
  .logo-title {
    font-size: 1rem;
  }
}

/* Высокие экраны */
@media (min-height: 800px) and (max-width: 768px) {
  .header-container {
    height: 65px;
  }
}

/* Анимации для плавных переходов */
.logo-link,
.menu-toggle,
.user-info,
.auth-button,
.notification-bell {
  transition: all var(--transition-normal);
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .logo-link,
  .menu-toggle,
  .user-info,
  .auth-button,
  .dropdown-arrow {
    transition: none;
  }
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
  .header {
    background: linear-gradient(135deg, #5a67d8 0%, #805ad5 100%);
  }
}
</style>