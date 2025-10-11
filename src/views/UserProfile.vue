<template>
  <div class="user-profile-page">
    <!-- Hero секция -->
    <div class="profile-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="user-main-card">
          <div class="user-avatar-section">
            <div class="avatar-container">
              <template v-if="!loading">
                <el-avatar :size="120" :src="user?.avatar_url ? user?.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" fit="cover" />
                <div class="online-status" :class="{ online: isUserOnline(user?.last_online) }">
                  <div class="status-dot"></div>
                </div>
              </template>
              <div v-else class="avatar-skeleton">
                <div class="skeleton-circle"></div>
              </div>
            </div>
          </div>
          
          <div class="user-basic-info">
            <template v-if="!loading">
              <div class="user-header">
                <h1 class="username">{{ user?.username }}</h1>
                <div class="user-badges">
                  <el-tag 
                    v-if="user?.team_id" 
                    type="success" 
                    effect="light"
                    class="team-badge"
                  >
                    <el-icon><Star /></el-icon>
                    В команде
                  </el-tag>
                  <el-tag 
                    :type="user?.is_searching ? 'primary' : 'info'" 
                    effect="light"
                    class="status-badge"
                  >
                    {{ user?.is_searching ? 'В поиске' : 'Не в поиске' }}
                  </el-tag>
                </div>
              </div>
              
              <div class="user-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ user?.mmr_rating || 'Не указан' }}</div>
                  <div class="stat-label">MMR</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ getRegionLabel(user?.region) }}</div>
                  <div class="stat-label">Регион</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">
                    <el-tag 
                      v-if="isUserOnline(user?.last_online)" 
                      type="success" 
                      effect="dark"
                    >
                      Online
                    </el-tag>
                    <el-tag v-else type="info" effect="dark">
                      Offline
                    </el-tag>
                  </div>
                  <div class="stat-label">Статус</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="header-skeleton">
                <div class="skeleton-line skeleton-title"></div>
                <div class="badges-skeleton">
                  <div class="skeleton-badge" v-for="i in 2" :key="i"></div>
                </div>
              </div>
              <div class="stats-skeleton">
                <div class="skeleton-stats">
                  <div class="skeleton-stat" v-for="i in 3" :key="i">
                    <div class="skeleton-line skeleton-value"></div>
                    <div class="skeleton-line skeleton-label"></div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="user-actions">
            <template v-if="!loading">
              <el-button 
                type="primary" 
                size="large"
                @click="startChat(user?.id)"
                :disabled="!user || user.id === authStore.user?.id"
                class="action-button chat-button"
              >
                Написать
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              
              <el-button 
                v-if="authStore.user?.team_id && !user?.team_id"
                type="success"
                size="large"
                @click="inviteToTeam"
                class="action-button invite-button"
              >
                Пригласить в команду
                <el-icon><User /></el-icon>
              </el-button>
              
              <el-button 
                type="danger"
                size="large"
                @click="blockUser"
                :disabled="!user || user.id === authStore.user?.id"
                class="action-button block-button"
              >
                Заблокировать
                <el-icon><Close /></el-icon>
              </el-button>
            </template>
            <template v-else>
              <div class="actions-skeleton">
                <div class="skeleton-button skeleton-primary"></div>
                <div class="skeleton-button skeleton-success"></div>
                <div class="skeleton-button skeleton-danger"></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="content-grid">
        <!-- Центральная колонка - Основная информация -->
        <div class="center-column">
          <!-- О себе -->
          <el-card v-if="user?.about_me" class="info-card about-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>О себе</h3>
                <el-icon><InfoFilled /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="about-skeleton">
              <div class="skeleton-line skeleton-text" v-for="i in 3" :key="i"></div>
            </div>
            <div v-else class="about-content">
              <p>{{ user.about_me }}</p>
            </div>
          </el-card>

          <!-- Игровые предпочтения -->
          <el-card class="info-card preferences-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Игровые предпочтения</h3>
                <el-icon><VideoPlay /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="preferences-skeleton">
              <div class="section-skeleton" v-for="i in 3" :key="i">
                <div class="skeleton-line skeleton-label-small"></div>
                <div class="tags-skeleton">
                  <div class="skeleton-tag" v-for="j in 4" :key="j"></div>
                </div>
              </div>
            </div>
            <div v-else class="preferences-content">
              <!-- Режимы игры -->
              <div class="preference-section" v-if="user?.game_modes?.length">
                <h4 class="section-title">Режимы игры</h4>
                <div class="tags-container">
                  <el-tag
                    v-for="mode in user.game_modes"
                    :key="mode"
                    type="info"
                    class="preference-tag"
                  >
                    {{ getGameModeLabel(mode) }}
                  </el-tag>
                </div>
              </div>

              <!-- Роли -->
              <div class="preference-section" v-if="user?.preferred_roles?.length">
                <h4 class="section-title">Предпочитаемые роли</h4>
                <div class="tags-container">
                  <el-tag
                    v-for="role in user.preferred_roles"
                    :key="role"
                    :type="getRoleType(role)"
                    size="small"
                    class="preference-tag"
                  >
                    {{ getRoleLabel(role) }}
                  </el-tag>
                </div>
              </div>

              <!-- Теги -->
              <div class="preference-section" v-if="user?.tags?.length">
                <h4 class="section-title">Теги</h4>
                <div class="tags-container">
                  <el-tag
                    v-for="tag in user.tags"
                    :key="tag"
                    type="warning"
                    class="preference-tag"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div class="empty-state" v-if="!user?.game_modes?.length && !user?.preferred_roles?.length">
                <el-icon><InfoFilled /></el-icon>
                <p>Пользователь не указал игровые предпочтения</p>
              </div>
            </div>
          </el-card>

          <!-- Статистика -->
          <el-card class="info-card stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Статистика</h3>
                <el-icon><DataAnalysis /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="stats-skeleton-grid">
              <div class="stat-card-skeleton" v-for="i in 3" :key="i">
                <div class="skeleton-icon"></div>
                <div class="stat-info-skeleton">
                  <div class="skeleton-line skeleton-stat-value"></div>
                  <div class="skeleton-line skeleton-stat-label"></div>
                </div>
              </div>
            </div>
            <div v-else class="stats-content">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon primary">
                    <el-icon><Clock /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">87%</div>
                    <div class="stat-label">Активность</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon success">
                    <el-icon><TrendCharts /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">24</div>
                    <div class="stat-label">Матчей сыграно</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon warning">
                    <el-icon><Star /></el-icon>
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">4.8</div>
                    <div class="stat-label">Рейтинг</div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Правая колонка - Дополнительная информация -->
        <div class="right-column">
          <!-- Команда -->
          <el-card v-if="user?.team" class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Команда</h3>
                <el-icon><Star /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="team-skeleton">
              <div class="skeleton-circle skeleton-avatar"></div>
              <div class="team-details-skeleton">
                <div class="skeleton-line skeleton-team-name"></div>
                <div class="skeleton-line skeleton-team-members"></div>
                <div class="skeleton-badge skeleton-captain"></div>
              </div>
            </div>
            <div v-else class="team-info" @click="$router.push(`/teams/${user.team.id}`)">
              <el-avatar :size="60" :src="user.team.avatar_url ? user.team.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" />
              <div class="team-details">
                <h4>{{ user.team.name }}</h4>
                <p>{{ user.team.members?.length || 0 }}/5 участников</p>
                <div class="team-captain" v-if="user.team.captain_id === user.id">
                  <el-tag type="success" size="small">Капитан</el-tag>
                </div>
              </div>
              <el-icon class="team-arrow"><ArrowRight /></el-icon>
            </div>
          </el-card>

          <!-- Активность -->
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Активность</h3>
                <el-icon><DataLine /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="activity-skeleton">
              <div class="activity-item-skeleton" v-for="i in 2" :key="i">
                <div class="skeleton-dot"></div>
                <div class="activity-info-skeleton">
                  <div class="skeleton-line skeleton-activity-text"></div>
                  <div class="skeleton-line skeleton-activity-time"></div>
                </div>
              </div>
            </div>
            <div v-else class="activity-content">
              <div class="activity-item">
                <div class="activity-dot recent"></div>
                <div class="activity-info">
                  <span>Был в сети</span>
                  <span class="activity-time">{{ getLastOnlineText(user?.last_online) }}</span>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-dot active"></div>
                <div class="activity-info">
                  <span>Активность</span>
                  <span class="activity-time">Высокая</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Совместимость -->
          <el-card class="info-card compatibility-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Совместимость</h3>
                <el-icon><Connection /></el-icon>
              </div>
            </template>
            <div v-if="loading" class="compatibility-skeleton">
              <div class="skeleton-circle skeleton-score"></div>
              <div class="factors-skeleton">
                <div class="skeleton-factor" v-for="i in 3" :key="i">
                  <div class="skeleton-line skeleton-factor-label"></div>
                  <div class="skeleton-bar"></div>
                  <div class="skeleton-line skeleton-factor-value"></div>
                </div>
              </div>
            </div>
            <div v-else class="compatibility-content">
              <div class="compatibility-score">
                <div class="score-circle">
                  <div class="score-value">82%</div>
                </div>
                <div class="score-label">Высокая совместимость</div>
              </div>
              
              <div class="compatibility-factors">
                <div class="factor-item">
                  <span class="factor-label">Регион</span>
                  <div class="factor-bar">
                    <div class="factor-progress" style="width: 100%"></div>
                  </div>
                  <span class="factor-value">100%</span>
                </div>
                
                <div class="factor-item">
                  <span class="factor-label">MMR</span>
                  <div class="factor-bar">
                    <div class="factor-progress" style="width: 75%"></div>
                  </div>
                  <span class="factor-value">75%</span>
                </div>
                
                <div class="factor-item">
                  <span class="factor-label">Режимы</span>
                  <div class="factor-bar">
                    <div class="factor-progress" style="width: 90%"></div>
                  </div>
                  <span class="factor-value">90%</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- Диалог приглашения в команду -->
    <el-dialog
      v-model="inviteDialogVisible"
      :title="`Пригласить ${user?.username} в команду`"
      width="500px"
      class="invite-dialog"
    >
      <el-form :model="inviteForm">
        <el-form-item label="Сообщение">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="4"
            placeholder="Напишите сообщение для приглашения..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="sendInvitation" :loading="sendingInvitation">
          Отправить приглашение
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { useChatStore } from '../stores/chat'
import { useInvitationsStore } from '../stores/invitations'
import { REGIONS, GAME_MODES, ROLES } from '../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Star,
  ChatDotRound,
  User,
  Close,
  VideoPlay,
  DataLine,
  InfoFilled,
  DataAnalysis,
  Connection,
  ArrowRight,
  Clock,
  TrendCharts
} from '@element-plus/icons-vue'

export default {
  name: 'UserProfile',
  components: {
    Star,
    ChatDotRound,
    User,
    Close,
    VideoPlay,
    DataLine,
    InfoFilled,
    DataAnalysis,
    Connection,
    ArrowRight,
    Clock,
    TrendCharts
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const usersStore = useUsersStore()
    const chatStore = useChatStore()
    const invitationsStore = useInvitationsStore()

    const user = ref(null)
    const loading = ref(true)
    const inviteDialogVisible = ref(false)
    const sendingInvitation = ref(false)

    const inviteForm = ref({
      message: ''
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const getGameModeLabel = (modeValue) => {
      const mode = GAME_MODES.find(m => m.value === modeValue)
      return mode ? mode.label : modeValue
    }

    const getRoleLabel = (roleValue) => {
      const role = ROLES.find(r => r.value === roleValue)
      return role ? role.label : roleValue
    }

    const getRoleType = (roleValue) => {
      const types = {
        'carry': 'danger',
        'mid': 'primary',
        'offlane': 'warning',
        'support': 'success',
        'hard_support': 'info'
      }
      return types[roleValue] || 'info'
    }

    const isUserOnline = (lastOnline) => {
      if (!lastOnline) return false
      const lastOnlineDate = new Date(lastOnline)
      const now = new Date()
      return (now - lastOnlineDate) < 5 * 60 * 1000 // 5 минут
    }

    const getLastOnlineText = (lastOnline) => {
      if (!lastOnline) return 'давно'
      
      const lastOnlineDate = new Date(lastOnline)
      const now = new Date()
      const diff = now - lastOnlineDate

      if (diff < 60 * 1000) {
        return 'только что'
      } else if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000))
        return `${minutes} мин. назад`
      } else if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000))
        return `${hours} ч. назад`
      } else {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000))
        return `${days} дн. назад`
      }
    }

    const loadUser = async () => {
      const userId = route.params.id
      loading.value = true
      try {
        user.value = await usersStore.getProfile(userId)
      } catch (error) {
        ElMessage.error('Ошибка загрузки профиля пользователя')
        router.push('/players')
      } finally {
        loading.value = false
      }
    }

    const startChat = async () => {
      if (!user.value) return

      try {
        const room = await chatStore.getOrCreatePrivateRoom(user.value.id)
        chatStore.setActiveRoom(room.id)
        router.push('/chat')
      } catch (error) {
        ElMessage.error('Ошибка создания чата')
      }
    }

    const inviteToTeam = () => {
      if (!authStore.user?.team_id) {
        ElMessage.warning('У вас нет команды для приглашения')
        return
      }
      inviteForm.value.message = `Привет! Я приглашаю тебя присоединиться к нашей команде.`
      inviteDialogVisible.value = true
    }

    const sendInvitation = async () => {
      if (!user.value) return

      sendingInvitation.value = true
      try {
        await invitationsStore.inviteUser(user.value.id, {
          teamId: authStore.user.team_id,
          message: inviteForm.value.message
        })
        inviteDialogVisible.value = false
        ElMessage.success('Приглашение отправлено!')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки приглашения')
      } finally {
        sendingInvitation.value = false
      }
    }

    const blockUser = async () => {
      if (!user.value) return

      try {
        await ElMessageBox.confirm(
          `Вы уверены, что хотите заблокировать пользователя ${user.value.username}?`,
          'Подтверждение блокировки',
          {
            confirmButtonText: 'Заблокировать',
            cancelButtonText: 'Отмена',
            type: 'warning'
          }
        )

        await usersStore.blockUser(user.value.id)
        ElMessage.success('Пользователь заблокирован')
        router.push('/players')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка блокировки пользователя')
        }
      }
    }

    onMounted(() => {
      loadUser()
    })

    return {
      authStore,
      user,
      loading,
      inviteDialogVisible,
      sendingInvitation,
      inviteForm,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      getRoleType,
      isUserOnline,
      getLastOnlineText,
      startChat,
      inviteToTeam,
      sendInvitation,
      blockUser
    }
  }
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
  overflow-x: hidden;
}

/* Hero секция */
.profile-hero {
  position: relative;
  background: var(--success-gradient);
  padding: 40px 0 60px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.3;
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-main-card {
  display: flex;
  align-items: center;
  gap: 30px;
  color: white;
}

.avatar-container {
  position: relative;
  border-radius: 50%;
  padding: 6px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.online-status {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.online-status.online .status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--success-gradient);
}

.avatar-skeleton {
  padding: 6px;
}

.user-basic-info {
  flex: 1;
  min-width: 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-wrap: break-word;
}

.user-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.team-badge,
.status-badge {
  border: none;
  font-weight: 500;
}

.user-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  flex: 1;
  min-width: 80px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
  flex-shrink: 0;
}

.action-button {
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 12px 16px;
  white-space: nowrap;
}

.chat-button {
  background: var(--primary-gradient);
}

.invite-button {
  background: var(--success-gradient);
}

.block-button {
  background: var(--danger-gradient);
}

/* Улучшенные скелетоны */
.skeleton-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-line {
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  height: 40px;
  width: 200px;
  margin-bottom: 16px;
}

.skeleton-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.skeleton-stat {
  text-align: center;
  flex: 1;
  min-width: 80px;
}

.skeleton-value {
  height: 24px;
  width: 60px;
  margin: 0 auto 6px;
}

.skeleton-label {
  height: 16px;
  width: 50px;
  margin: 0 auto;
}

.skeleton-badge {
  height: 28px;
  width: 100px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin-right: 8px;
}

.skeleton-button {
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-primary {
  background: linear-gradient(90deg, rgba(102,126,234,0.2) 25%, rgba(102,126,234,0.3) 50%, rgba(102,126,234,0.2) 75%);
}

.skeleton-success {
  background: linear-gradient(90deg, rgba(16,185,129,0.2) 25%, rgba(16,185,129,0.3) 50%, rgba(16,185,129,0.2) 75%);
}

.skeleton-danger {
  background: linear-gradient(90deg, rgba(239,68,68,0.2) 25%, rgba(239,68,68,0.3) 50%, rgba(239,68,68,0.2) 75%);
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-text:last-child {
  width: 80%;
}

.skeleton-label-small {
  height: 16px;
  width: 80px;
  margin-bottom: 8px;
}

.skeleton-tag {
  height: 24px;
  width: 60px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin-right: 6px;
  margin-bottom: 6px;
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-stat-value {
  height: 20px;
  width: 40px;
  margin-bottom: 4px;
}

.skeleton-stat-label {
  height: 14px;
  width: 60px;
}

.skeleton-avatar {
  width: 60px;
  height: 60px;
}

.skeleton-team-name {
  height: 20px;
  width: 120px;
  margin-bottom: 6px;
}

.skeleton-team-members {
  height: 16px;
  width: 80px;
  margin-bottom: 6px;
}

.skeleton-captain {
  height: 20px;
  width: 60px;
}

.skeleton-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-activity-text {
  height: 16px;
  width: 80px;
  margin-bottom: 4px;
}

.skeleton-activity-time {
  height: 14px;
  width: 60px;
}

.skeleton-score {
  width: 100px;
  height: 100px;
}

.skeleton-factor-label {
  height: 16px;
  width: 60px;
}

.skeleton-bar {
  height: 6px;
  flex: 1;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 3px;
  margin: 0 8px;
}

.skeleton-factor-value {
  height: 14px;
  width: 30px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.header-skeleton,
.stats-skeleton {
  margin-bottom: 20px;
}

.badges-skeleton {
  display: flex;
  gap: 8px;
}

.actions-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Основной контент */
.profile-content {
  max-width: 1200px;
  margin: -30px auto 0;
  padding: 0 20px 40px;
  position: relative;
  box-sizing: border-box;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  align-items: start;
}

/* Карточки */
.info-card {
  border: none;
  border-radius: var(--border-radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  margin-bottom: 24px;
  overflow: hidden;
}

.info-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px !important;
  border: none !important;
  background: var(--bg-secondary);
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 1.2rem;
}

.card-header .el-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* Скелетоны */
.about-skeleton {
  padding: 24px;
}

.preferences-skeleton {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tags-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stats-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 24px;
}

.stat-card-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
}

.stat-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.team-details-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.activity-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.activity-item-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.compatibility-skeleton {
  text-align: center;
  padding: 24px;
}

.factors-skeleton {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-factor {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Центральная колонка */
.about-card .about-content {
  line-height: 1.6;
  color: var(--text-secondary);
  padding: 8px 24px 24px;
}

.preferences-content {
  padding: 8px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preference-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preference-tag {
  border: none;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}

.empty-state .el-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.stats-content {
  padding: 8px 24px 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius);
  color: white;
  font-size: 1.5rem;
}

.stat-icon.primary {
  background: var(--primary-gradient);
}

.stat-icon.success {
  background: var(--success-gradient);
}

.stat-icon.warning {
  background: var(--warning-gradient);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Правая колонка */
.team-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.team-info:hover {
  background: var(--primary-color);
  color: white;
}

.team-info:hover .team-arrow {
  color: white;
}

.team-details {
  flex: 1;
  min-width: 0;
}

.team-details h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-details p {
  margin: 0 0 4px 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.team-arrow {
  margin-left: auto;
  color: var(--text-muted);
  flex-shrink: 0;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 24px 24px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.activity-dot.recent {
  background: var(--success-gradient);
}

.activity-dot.active {
  background: var(--warning-gradient);
}

.activity-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.compatibility-content {
  text-align: center;
  padding: 8px 24px 24px;
}

.compatibility-score {
  margin-bottom: 24px;
}

.score-circle {
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: conic-gradient(var(--primary-color) 82%, var(--border-color) 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 80px;
  height: 80px;
  background: var(--bg-card);
  border-radius: 50%;
}

.score-value {
  position: relative;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.score-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.compatibility-factors {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.factor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.factor-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  min-width: 60px;
  text-align: left;
}

.factor-bar {
  flex: 1;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.factor-progress {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 3px;
  transition: width var(--transition-slow);
}

.factor-value {
  font-size: 0.8rem;
  color: var(--text-muted);
  min-width: 30px;
  text-align: right;
}

/* Диалог */
:deep(.invite-dialog .el-dialog) {
  border-radius: var(--border-radius-lg);
}

:deep(.invite-dialog .el-textarea__inner) {
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .right-column {
    order: 2;
  }
  
  .center-column {
    order: 1;
  }
}

@media (max-width: 900px) {
  .profile-hero {
    padding: 30px 0 50px;
  }
  
  .user-main-card {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .user-header {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .user-stats {
    justify-content: center;
    gap: 20px;
  }
  
  .user-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: auto;
    width: 100%;
  }
  
  .action-button {
    flex: 1;
    min-width: 140px;
  }
  
  .username {
    font-size: 1.8rem;
  }
  
  .profile-content {
    margin-top: -20px;
    padding: 0 16px 30px;
  }
  
  .content-grid {
    gap: 16px;
  }
  
  .card-header {
    padding: 16px 20px !important;
  }
  
  .card-header h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 16px;
  }
  
  .profile-content {
    padding: 0 12px 20px;
  }
  
  .user-stats {
    gap: 15px;
  }
  
  .stat-item {
    min-width: 70px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .about-content,
  .preferences-content,
  .stats-content,
  .activity-content,
  .compatibility-content {
    padding: 8px 16px 16px;
  }
}

@media (max-width: 600px) {
  .profile-hero {
    padding: 25px 0 40px;
  }
  
  .username {
    font-size: 1.6rem;
  }
  
  .avatar-container {
    padding: 4px;
  }
  
  .skeleton-circle {
    width: 100px;
    height: 100px;
  }
  
  .skeleton-title {
    width: 160px;
    height: 32px;
  }
  
  .user-stats {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
  
  .stat-item {
    min-width: 100px;
  }
  
  .user-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
  
  .preference-section {
    gap: 8px;
  }
  
  .tags-container {
    gap: 4px;
  }
  
  .team-info {
    padding: 12px;
  }
  
  .score-circle {
    width: 80px;
    height: 80px;
  }
  
  .score-circle::before {
    width: 64px;
    height: 64px;
  }
  
  .score-value {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 12px;
  }
  
  .profile-content {
    padding: 0 8px 16px;
  }
  
  .username {
    font-size: 1.4rem;
  }
  
  .user-main-card {
    gap: 20px;
  }
  
  .card-header {
    padding: 12px 16px !important;
  }
  
  .card-header h3 {
    font-size: 1rem;
  }
  
  .about-content,
  .preferences-content,
  .stats-content,
  .activity-content,
  .compatibility-content {
    padding: 8px 12px 12px;
  }
  
  .empty-state {
    padding: 30px 16px;
  }
  
  .empty-state .el-icon {
    font-size: 2.5rem;
  }
  
  .factor-item {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .factor-label {
    min-width: 50px;
    font-size: 0.85rem;
  }
  
  .factor-bar {
    order: 3;
    width: 100%;
    margin: 0;
  }
  
  .factor-value {
    min-width: 25px;
    font-size: 0.75rem;
  }
}

@media (max-width: 360px) {
  .username {
    font-size: 1.3rem;
  }
  
  .profile-content {
    margin-top: -15px;
  }
  
  .skeleton-circle {
    width: 80px;
    height: 80px;
  }
  
  .skeleton-title {
    width: 140px;
    height: 28px;
  }
  
  .stat-value {
    font-size: 1.1rem;
  }
  
  .score-circle {
    width: 70px;
    height: 70px;
  }
  
  .score-circle::before {
    width: 56px;
    height: 56px;
  }
  
  .score-value {
    font-size: 1.1rem;
  }
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .skeleton-circle,
  .skeleton-line,
  .skeleton-badge,
  .skeleton-button,
  .skeleton-tag,
  .skeleton-icon,
  .skeleton-dot,
  .skeleton-bar {
    animation: none;
  }
  
  .info-card,
  .team-info,
  .action-button {
    transition: none;
  }
  
  .info-card:hover,
  .team-info:hover,
  .action-button:hover {
    transform: none;
  }
}

/* Исправление выхода за экран */
.user-profile-page,
.profile-hero,
.profile-content,
.hero-content {
  max-width: 100%;
  overflow-x: hidden;
}

.content-grid,
.user-main-card,
.user-stats,
.user-header {
  max-width: 100%;
}

/* Улучшение скролла */
@media (max-width: 768px) {
  .user-profile-page {
    -webkit-overflow-scrolling: touch;
  }
}

/* Улучшение отображения текста */
.username,
.team-details h4 {
  word-break: break-word;
  overflow-wrap: break-word;
}

.user-badges {
  justify-content: center;
}

@media (max-width: 900px) {
  .user-badges {
    justify-content: center;
  }
}
</style>