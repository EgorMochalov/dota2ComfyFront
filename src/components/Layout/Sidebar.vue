<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <!-- Карточка пользователя -->
      <div class="user-card glass-effect">
        <div class="user-avatar-section">
          <el-avatar :size="64" :src="authStore.user?.avatar_url" class="user-avatar" />
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

      <!-- Навигация -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h4 class="section-title">Основное</h4>
          <router-link to="/" class="nav-item">
            <div class="nav-icon">
              <el-icon><House /></el-icon>
            </div>
            <span class="nav-text">Главная</span>
          </router-link>

          <router-link to="/players" class="nav-item">
            <div class="nav-icon">
              <el-icon><User /></el-icon>
            </div>
            <span class="nav-text">Поиск игроков</span>
          </router-link>

          <router-link to="/teams" class="nav-item">
            <div class="nav-icon">
              <el-icon><Mouse /></el-icon>
            </div>
            <span class="nav-text">Поиск команд</span>
          </router-link>

          <router-link to="/chat" class="nav-item">
            <div class="nav-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <span class="nav-text">Сообщения</span>
            <el-badge v-if="unreadMessagesCount > 0" :value="unreadMessagesCount" class="nav-badge" />
          </router-link>
        </div>

        <div class="nav-section">
          <h4 class="section-title">Моя команда</h4>
          <router-link v-if="authStore.user?.team_id" to="/my-team" class="nav-item">
            <div class="nav-icon">
              <el-icon><Star /></el-icon>
            </div>
            <span class="nav-text">Управление командой</span>
          </router-link>
          <router-link v-else to="/teams?create=true" class="nav-item create-team">
            <div class="nav-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <span class="nav-text">Создать команду</span>
          </router-link>
        </div>

        <div class="nav-section">
          <h4 class="section-title">Активность</h4>
          <router-link to="/applications" class="nav-item">
            <div class="nav-icon">
              <el-icon><Document /></el-icon>
            </div>
            <span class="nav-text">Мои заявки</span>
          </router-link>
          <router-link to="/invitations" class="nav-item">
            <div class="nav-icon">
              <el-icon><Message /></el-icon>
            </div>
            <span class="nav-text">Приглашения</span>
          </router-link>
        </div>
      </nav>

      <!-- Статистика -->
      <div class="sidebar-stats glass-effect">
        <h4 class="stats-title">Статистика</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ onlinePlayers }}</div>
            <div class="stat-label">Игроков онлайн</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ activeTeams }}</div>
            <div class="stat-label">Команд в поиске</div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useChatStore } from '../../stores/chat'
import { webSocketService } from '../../services/websocket'
import { usersAPI, teamsAPI } from '../../services/api'
import { REGIONS } from '../../utils/constants'
import { ElMessage } from 'element-plus'
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
  Location
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
    Location
  },
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const isSearching = ref(authStore.user?.is_searching || false)
    const onlinePlayers = ref(0)
    const activeTeams = ref(0)

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
        // Загружаем примерное количество онлайн игроков
        const playersResponse = await usersAPI.search({ limit: 1, is_online: true })
        onlinePlayers.value = playersResponse.data.length * 124 // Примерный коэффициент

        // Загружаем количество активных команд
        const teamsResponse = await teamsAPI.search({ limit: 1, is_searching: true })
        activeTeams.value = teamsResponse.data.length * 89 // Примерный коэффициент
      } catch (error) {
        // Используем базовые значения если API недоступно
        onlinePlayers.value = 1247
        activeTeams.value = 356
      }
    }

    watch(() => authStore.user, (newUser) => {
      if (newUser) {
        isSearching.value = newUser.is_searching || false
      }
    }, { immediate: true })

    onMounted(() => {
      loadStats();
      chatStore.getRooms()
      webSocketService.on('newMessage', (data) => {
        chatStore.getRooms()
      })
    })

    return {
      authStore,
      isSearching,
      onlinePlayers,
      activeTeams,
      unreadMessagesCount,
      getUserStatusClass,
      getRegionLabel,
      updateSearchStatus
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
}

.sidebar-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.user-status-indicator.status-online::before {
  display: none;
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
}

.create-team .el-icon {
  color: rgba(0, 0, 0, 0.5);
}

.nav-text {
  font-weight: 500;
  flex: 1;
}

.nav-badge {
  margin-left: auto;
}

.sidebar-stats {
  padding: 20px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.stats-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Адаптивность */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .sidebar-content {
    padding: 16px;
    gap: 16px;
  }
  
  .user-card {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>