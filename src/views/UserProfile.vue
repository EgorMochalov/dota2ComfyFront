<template>
  <div class="user-profile-page">
    <!-- Hero секция -->
    <div class="profile-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="user-main-card">
          <div class="user-avatar-section">
            <div class="avatar-container">
              <el-avatar :size="120" :src="user?.avatar_url" fit="cover" />
              <div class="online-status" :class="{ online: isUserOnline(user?.last_online) }">
                <div class="status-dot"></div>
              </div>
            </div>
          </div>
          
          <div class="user-basic-info">
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
                <div class="stat-label">MMR рейтинг</div>
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
          </div>

          <div class="user-actions">
            <el-button 
              type="primary" 
              size="large"
              @click="startChat(user?.id)"
              :disabled="!user || user.id === authStore.user?.id"
              class="action-button chat-button"
            >
              <el-icon><ChatDotRound /></el-icon>
              Написать
            </el-button>
            
            <el-button 
              v-if="authStore.user?.team_id && !user?.team_id"
              type="success"
              size="large"
              @click="inviteToTeam"
              class="action-button invite-button"
            >
              <el-icon><User /></el-icon>
              Пригласить в команду
            </el-button>
            
            <el-button 
              type="danger"
              size="large"
              @click="blockUser"
              :disabled="!user || user.id === authStore.user?.id"
              class="action-button block-button"
            >
              <el-icon><Close /></el-icon>
              Заблокировать
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="content-grid">
        <!-- Левая колонка - Информация о пользователе -->
        <div class="left-column">
          <!-- Карточка команды -->
          <el-card v-if="user?.team" class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Команда</h3>
                <el-icon><Star /></el-icon>
              </div>
            </template>
            <div class="team-info" @click="$router.push(`/teams/${user.team.id}`)">
              <el-avatar :size="60" :src="user.team.avatar_url" />
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

          <!-- Карточка контактов -->
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Контакт</h3>
                <el-icon><Message /></el-icon>
              </div>
            </template>
            <div class="contact-actions">
              <el-button 
                type="primary" 
                class="contact-button"
                @click="startChat(user?.id)"
                :disabled="!user || user.id === authStore.user?.id"
              >
                <el-icon><ChatDotRound /></el-icon>
                Начать чат
              </el-button>
              <el-button 
                class="contact-button"
                @click="viewSteamProfile"
                v-if="user?.steam_id"
              >
                <el-icon><VideoPlay /></el-icon>
                Steam профиль
              </el-button>
            </div>
          </el-card>

          <!-- Карточка активности -->
          <el-card class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Активность</h3>
                <el-icon><DataLine /></el-icon>
              </div>
            </template>
            <div class="activity-content">
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
        </div>

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
            <div class="about-content">
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
            <div class="preferences-content">
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
                <div class="">
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
            <div class="stats-content">
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
          <!-- Быстрые действия -->
          <el-card class="info-card actions-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Действия</h3>
                <el-icon><Lightning /></el-icon>
              </div>
            </template>
            <div class="actions-content">
              <el-button 
                type="primary" 
                class="action-button"
                @click="startChat(user?.id)"
                :disabled="!user || user.id === authStore.user?.id"
              >
                <el-icon><ChatDotRound /></el-icon>
                Написать сообщение
              </el-button>
              
              <el-button 
                v-if="authStore.user?.team_id && !user?.team_id"
                type="success"
                class="action-button"
                @click="inviteToTeam"
              >
                <el-icon><User /></el-icon>
                Пригласить в команду
              </el-button>
              
              <el-button 
                class="action-button"
                @click="$router.push('/players')"
              >
                <el-icon><Search /></el-icon>
                Найти похожих
              </el-button>
              
              <el-button 
                type="danger"
                class="action-button"
                @click="blockUser"
                :disabled="!user || user.id === authStore.user?.id"
              >
                <el-icon><Close /></el-icon>
                Заблокировать
              </el-button>
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
            <div class="compatibility-content">
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
  Message,
  VideoPlay,
  DataLine,
  InfoFilled,
  DataAnalysis,
  Lightning,
  Search,
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
    Message,
    VideoPlay,
    DataLine,
    InfoFilled,
    DataAnalysis,
    Lightning,
    Search,
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

    const getRoleClass = (roleValue) => {
      const classes = {
        'carry': 'role-carry',
        'mid': 'role-mid',
        'offlane': 'role-offlane',
        'support': 'role-support',
        'hard_support': 'role-hard-support'
      }
      return classes[roleValue] || 'role-default'
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

    const viewSteamProfile = () => {
      if (user.value?.steam_id) {
        window.open(`https://steamcommunity.com/profiles/${user.value.steam_id}`, '_blank')
      } else {
        ElMessage.warning('Steam ID не указан')
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
      getRoleClass,
      isUserOnline,
      getLastOnlineText,
      startChat,
      inviteToTeam,
      sendInvitation,
      blockUser,
      viewSteamProfile,
      getRoleType
    }
  }
}
</script>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero секция */
.profile-hero {
  position: relative;
  background: var(--secondary-gradient);
  padding: 60px 0 80px;
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
  gap: 40px;
  color: white;
}

.avatar-container {
  position: relative;
  border-radius: 50%;
  padding: 8px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
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

.user-basic-info {
  flex: 1;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.username {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-badges {
  display: flex;
  gap: 8px;
}

.team-badge,
.status-badge {
  border: none;
  font-weight: 500;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
}

.action-button {
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 12px 16px;
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

/* Основной контент */
.profile-content {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px 40px;
  position: relative;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
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
}

.info-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 !important;
  border: none !important;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.card-header .el-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* Левая колонка */
.team-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
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
}

.team-details h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.team-details p {
  margin: 0 0 4px 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.team-arrow {
  margin-left: auto;
  color: var(--text-muted);
}

.contact-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-button {
  justify-content: flex-start;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  font-weight: 500;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

/* Центральная колонка */
.about-card .about-content {
  line-height: 1.6;
  color: var(--text-secondary);
}

.preferences-content {
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

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.role-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.role-carry {
  border-left: 4px solid #e74c3c;
}

.role-mid {
  border-left: 4px solid #3498db;
}

.role-offlane {
  border-left: 4px solid #f39c12;
}

.role-support {
  border-left: 4px solid #27ae60;
}

.role-hard-support {
  border-left: 4px solid #9b59b6;
}

.role-default {
  border-left: 4px solid var(--border-color);
}

.role-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  border-radius: 50%;
  color: white;
}

.role-name {
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
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
}

.stats-content {
  padding: 8px 0;
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
.actions-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  justify-content: flex-start;
  padding: 12px 16px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.action-button:hover {
  transform: translateX(4px);
}

.compatibility-content {
  text-align: center;
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
  
  .left-column,
  .right-column {
    order: 2;
  }
  
  .center-column {
    order: 1;
  }
}

@media (max-width: 768px) {
  .profile-hero {
    padding: 40px 0 60px;
  }
  
  .user-main-card {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .user-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .user-actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    min-width: auto;
  }
  
  .username {
    font-size: 2rem;
  }
  
  .profile-content {
    margin-top: -20px;
    padding: 0 16px 20px;
  }
  
  .roles-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}

@media (max-width: 480px) {
  .user-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .user-actions {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>