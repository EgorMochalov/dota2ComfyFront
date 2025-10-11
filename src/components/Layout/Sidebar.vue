<template>
  <div>
    <!-- Оверлей для мобильных -->
    <div 
      v-if="isMobile && sidebarOpen" 
      class="sidebar-overlay" 
      @click="closeSidebar"
    ></div>

    <aside class="sidebar" :class="{ 
      'sidebar-mobile-open': sidebarOpen,
      'sidebar-compact': isCompact
    }">
      <div class="sidebar-content">
        <!-- Кнопка закрытия для мобильных -->
        <div class="sidebar-close" @click="closeSidebar" v-if="isMobile && sidebarOpen">
          <el-icon><Close /></el-icon>
        </div>

        <!-- Карточка пользователя -->
        <div class="user-card glass-effect" v-if="!isCompact">
          <div class="user-avatar-section">
            <el-avatar :size="64" :src="authStore.user?.avatar_url ? authStore.user.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" class="user-avatar" />
            <div class="user-status-indicator" :class="getUserStatusClass"></div>
          </div>
          
          <div class="user-info">
            <h3 class="username">{{ authStore.user?.username }}</h3>
            <p class="user-mmr">
              <el-icon><Trophy /></el-icon>
              MMR: {{ authStore.user?.mmr_rating || 'Не указан' }}
            </p>
            <p class="user-region">
              <el-icon><Location /></el-icon>
              {{ getRegionLabel(authStore.user?.region) }}
            </p>
          </div>
          
          <div class="search-status">
            <el-switch
              v-model="isSearching"
              @change="updateSearchStatus"
              active-color="var(--success-color)"
              size="large"
            />
            <span class="status-label">
              {{ isSearching ? 'В поиске' : 'Не активен' }}
            </span>
          </div>
        </div>

        <!-- Компактная карточка пользователя -->
        <div class="user-card-compact glass-effect" v-else>
          <div class="user-avatar-section">
            <el-avatar :size="44" :src="authStore.user?.avatar_url ? authStore.user.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" class="user-avatar" />
            <div class="user-status-indicator" :class="getUserStatusClass"></div>
          </div>
          <el-tooltip
            :content="isSearching ? 'В поиске' : 'Не активен'"
            placement="right"
          >
            <el-switch
              v-model="isSearching"
              @change="updateSearchStatus"
              active-color="var(--success-color)"
              size="small"
              class="compact-switch"
            />
          </el-tooltip>
        </div>

        <!-- Навигация -->
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h4 class="section-title" v-if="!isCompact">Основное</h4>
            <router-link to="/" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><House /></el-icon>
              </div>
              <span class="nav-text">Главная</span>
              <el-tooltip
                v-if="isCompact"
                content="Главная"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>

            <router-link to="/players" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><User /></el-icon>
              </div>
              <span class="nav-text">Поиск игроков</span>
              <el-tooltip
                v-if="isCompact"
                content="Поиск игроков"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>

            <router-link to="/teams" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><Mouse /></el-icon>
              </div>
              <span class="nav-text">Поиск команд</span>
              <el-tooltip
                v-if="isCompact"
                content="Поиск команд"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>

            <router-link to="/chat" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <span class="nav-text">Сообщения</span>
              <el-badge v-if="unreadMessagesCount > 0" :value="unreadMessagesCount" class="nav-badge" />
              <el-tooltip
                v-if="isCompact"
                :content="`Сообщения${unreadMessagesCount > 0 ? ` (${unreadMessagesCount})` : ''}`"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>
          </div>

          <div class="nav-section">
            <h4 class="section-title" v-if="!isCompact">Моя команда</h4>
            <router-link v-if="authStore.user?.team_id" to="/my-team" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><Star /></el-icon>
              </div>
              <span class="nav-text">Управление командой</span>
              <el-tooltip
                v-if="isCompact"
                content="Управление командой"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>
            <router-link v-else to="/teams?create=true" class="nav-item create-team" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><Plus /></el-icon>
              </div>
              <span class="nav-text">Создать команду</span>
              <el-tooltip
                v-if="isCompact"
                content="Создать команду"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>
          </div>

          <div class="nav-section">
            <h4 class="section-title" v-if="!isCompact">Активность</h4>
            <router-link to="/applications" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><Document /></el-icon>
              </div>
              <span class="nav-text">Мои заявки</span>
              <el-tooltip
                v-if="isCompact"
                content="Мои заявки"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>
            <router-link to="/invitations" class="nav-item" @click="closeSidebarOnMobile">
              <div class="nav-icon">
                <el-icon><Message /></el-icon>
              </div>
              <span class="nav-text">Приглашения</span>
              <el-tooltip
                v-if="isCompact"
                content="Приглашения"
                placement="right"
              >
                <div class="nav-tooltip-target"></div>
              </el-tooltip>
            </router-link>
          </div>
        </nav>
      </div>
    </aside>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import { webSocketService } from '../../services/websocket'
import { usersAPI, teamsAPI } from '../../services/api'
import { REGIONS } from '../../utils/constants'
import { ElMessage, ElTooltip } from 'element-plus'
import {
  House,
  User,
  Mouse,
  ChatDotRound,
  Star,
  Plus,
  Document,
  Message,
  Trophy,
  Location,
  Close
} from '@element-plus/icons-vue'

export default {
  name: 'Sidebar',
  components: {
    House,
    User,
    Mouse,
    ChatDotRound,
    Star,
    Plus,
    Document,
    Message,
    Trophy,
    Location,
    Close,
    ElTooltip
  },
  props: {
    mobileOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const isSearching = ref(authStore.user?.is_searching || false)
    const onlinePlayers = ref(0)
    const activeTeams = ref(0)
    const sidebarOpen = ref(false)
    const isMobile = ref(false)
    const isCompact = ref(false)

    const checkScreenSize = () => {
      const width = window.innerWidth
      isMobile.value = width < 768
      isCompact.value = width >= 768 && width < 1400
    }

    const closeSidebar = () => {
      sidebarOpen.value = false
      emit('close')
    }

    const closeSidebarOnMobile = () => {
      if (isMobile.value) {
        closeSidebar()
      }
    }

    const unreadMessagesCount = computed(() => chatStore.unreadCount)

    const getUserStatusClass = computed(() => {
      return isSearching.value ? 'status-online' : 'status-offline'
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const updateSearchStatus = async (value) => {
      try {
        await usersAPI.updateSearchStatus({ is_searching: value })
        authStore.user.is_searching = value
        ElMessage.success(`Статус поиска обновлен: ${value ? 'В поиске' : 'Не в поиске'}`)
      } catch (error) {
        isSearching.value = !value
        ElMessage.error('Ошибка обновления статуса поиска')
      }
    }

    const loadStats = async () => {
      try {
        const playersResponse = await usersAPI.search({ limit: 1, is_online: true })
        onlinePlayers.value = playersResponse.data.length * 124

        const teamsResponse = await teamsAPI.search({ limit: 1, is_searching: true })
        activeTeams.value = teamsResponse.data.length * 89
      } catch (error) {
        onlinePlayers.value = 1247
        activeTeams.value = 356
      }
    }

    watch(() => authStore.user, (newUser) => {
      if (newUser) {
        isSearching.value = newUser.is_searching || false
      }
    }, { immediate: true })

    watch(() => props.mobileOpen, (newVal) => {
      sidebarOpen.value = newVal
    })

    onMounted(() => {
      checkScreenSize()
      window.addEventListener('resize', checkScreenSize)
      loadStats()
      chatStore.getRooms()
      webSocketService.on('newMessage', (data) => {
        chatStore.getRooms()
      })
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkScreenSize)
    })

    return {
      authStore,
      isSearching,
      onlinePlayers,
      activeTeams,
      unreadMessagesCount,
      sidebarOpen,
      isMobile,
      isCompact,
      getUserStatusClass,
      getRegionLabel,
      updateSearchStatus,
      closeSidebar,
      closeSidebarOnMobile
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
  transition: all var(--transition-normal);
  z-index: 1000;
  height: 100%;
}

.sidebar-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

/* Компактный режим (768px - 1399px) */
.sidebar-compact {
  width: 80px;
}

.sidebar-compact .sidebar-content {
  padding: 20px 12px;
  gap: 20px;
}

/* Компактная карточка пользователя */
.user-card-compact {
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  border-radius: var(--border-radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.sidebar-compact .user-card-compact {
  display: flex;
}

.sidebar-compact .user-card {
  display: none;
}

.user-card-compact .user-avatar-section {
  position: relative;
  display: flex;
  justify-content: center;
}

.user-card-compact .user-avatar {
  border: 3px solid white;
  box-shadow: var(--shadow-md);
}

.user-card-compact .user-status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.compact-switch {
  transform: scale(0.9);
}

/* Навигация в компактном режиме */
.sidebar-compact .section-title {
  display: none;
}

.sidebar-compact .nav-text {
  display: none;
}

.sidebar-compact .nav-badge {
  display: none;
}

.sidebar-compact .nav-item {
  justify-content: center;
  padding: 12px;
  position: relative;
}

.sidebar-compact .nav-item::before {
  display: none;
}

.sidebar-compact .nav-icon {
  margin: 0;
}

.sidebar-compact .nav-tooltip-target {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* Бейджи для компактного режима */
.sidebar-compact .nav-item:has(.nav-badge)::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: var(--danger-gradient);
  border-radius: 50%;
  border: 2px solid white;
}

/* Кнопка закрытия для мобильных */
.sidebar-close {
  display: none;
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.sidebar-close:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

/* Оверлей для мобильных */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* Мобильный режим (< 768px) */
@media (max-width: 767px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    z-index: 1000;
    width: 320px;
    max-width: 85vw;
    box-shadow: var(--shadow-xl);
  }
  
  .sidebar.sidebar-mobile-open {
    transform: translateX(0);
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .sidebar-close {
    display: flex;
  }
  
  .sidebar-content {
    padding: 20px;
    gap: 20px;
    height: 100%;
    overflow-y: auto;
  }
  
  .user-card {
    padding: 20px;
    margin-top: 10px;
  }
  
  .user-avatar {
    border-width: 3px;
  }
  
  .username {
    font-size: 1rem;
  }
  
  .user-mmr,
  .user-region {
    font-size: 0.85rem;
    justify-content: flex-start;
  }
  
  .search-status {
    padding: 10px;
    gap: 10px;
  }
  
  .sidebar-nav {
    gap: 20px;
  }
  
  .nav-item {
    padding: 14px 16px;
  }
  
  .nav-item:hover {
    transform: none;
  }
}

/* Планшетный режим (768px - 1399px) */
@media (min-width: 768px) and (max-width: 1399px) {
  .sidebar {
    width: 80px;
  }
  
  .sidebar-content {
    padding: 20px 12px;
    gap: 20px;
  }
  
  .user-card {
    display: none;
  }
  
  .user-card-compact {
    display: flex;
  }
  
  .section-title {
    display: none;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-badge {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  
  .nav-item:has(.nav-badge)::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: var(--danger-gradient);
    border-radius: 50%;
    border: 2px solid white;
  }
}

/* Десктопный режим (1400px+) */
@media (min-width: 1400px) {
  .sidebar {
    width: 300px;
  }
  
  .sidebar-content {
    padding: 24px;
    gap: 24px;
  }
  
  .user-card {
    display: block;
  }
  
  .user-card-compact {
    display: none;
  }
  
  .section-title {
    display: block;
  }
  
  .nav-text {
    display: block;
  }
  
  .nav-badge {
    display: block;
  }
  
  .nav-item {
    justify-content: flex-start;
    padding: 12px 16px;
  }
  
  .nav-item:has(.nav-badge)::after {
    display: none;
  }
}

.user-card {
  padding: 24px;
  border-radius: var(--border-radius-lg);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.user-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.user-avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.user-avatar {
  border: 4px solid white;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.user-status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
}

.user-status-indicator.status-online {
  background: var(--success-gradient);
}

.user-status-indicator.status-offline {
  background: #94a3b8;
}

.user-info {
  margin-bottom: 16px;
}

.username {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.user-mmr,
.user-region {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.search-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.status-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  position: relative;
  background: transparent;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: var(--border-color);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.nav-item.router-link-active {
  background: var(--primary-gradient);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-sm);
}

.nav-item.router-link-active .nav-icon {
  background: rgba(255, 255, 255, 0.2);
}

.nav-item.create-team {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
}

.nav-item.create-team:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.create-team .el-icon {
  color: rgba(0, 0, 0, 0.5);
}

.nav-text {
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  margin-left: auto;
  flex-shrink: 0;
}

/* Адаптивность для маленьких мобильных */
@media (max-width: 480px) {
  .sidebar {
    width: 300px;
    max-width: 90vw;
  }
  
  .sidebar-content {
    padding: 16px;
    gap: 16px;
  }
  
  .user-card {
    padding: 16px;
  }
  
  .user-info {
    margin-bottom: 12px;
  }
  
  .nav-item {
    padding: 12px 14px;
    gap: 10px;
  }
  
  .nav-icon {
    width: 32px;
    height: 32px;
  }
  
  .section-title {
    font-size: 0.75rem;
  }
}
</style>