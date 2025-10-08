<template>
  <div class="team-detail-page">
    <!-- Hero секция команды -->
    <div class="team-hero" :style="heroStyle">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="team-basic-info">
          <el-avatar 
            :size="120" 
            :src="team?.avatar_url" 
            class="team-avatar"
          />
          <div class="team-main-info">
            <h1 class="team-name">{{ team?.name }}</h1>
            <div class="team-meta">
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ getRegionLabel(team?.region) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ team?.members?.length || 0 }}/5 участников</span>
              </div>
              <div class="meta-item">
                <el-icon><Trophy /></el-icon>
                <span>MMR: {{ team?.mmr_range_min }} - {{ team?.mmr_range_max }}</span>
              </div>
            </div>
            <div class="team-status-badges">
              <el-tag 
                v-if="team?.is_searching" 
                type="success" 
                class="status-badge"
              >
                <el-icon><Search /></el-icon>
                В поиске игроков
              </el-tag>
              <el-tag 
                v-if="team?.looking_for_scrim" 
                type="warning" 
                class="status-badge"
              >
                <el-icon><Star /></el-icon>
                Ищет команды для кв
              </el-tag>
            </div>
          </div>
        </div>
        
        <div class="hero-actions" v-if="authStore.user?.id !== team?.captain_id">
          <el-button
            type="primary"
            size="large"
            @click="applyToTeam"
            :disabled="authStore.user?.team_id || !team?.is_searching"
            class="action-btn"
          >
            <template #icon>
              <el-icon><DocumentAdd /></el-icon>
            </template>
            Подать заявку
          </el-button>
          <el-button
            v-if="authStore.user?.team_id && team?.looking_for_scrim"
            type="warning"
            size="large"
            @click="contactForScrim"
            class="action-btn"
          >
            <template #icon>
              <el-icon><ChatDotRound /></el-icon>
            </template>
            Предложить кв
          </el-button>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="team-content">
      <div class="content-grid">
        <!-- Левая колонка - основная информация -->
        <div class="main-column">
          <!-- Описание команды -->
          <el-card class="info-card" v-if="team?.description">
            <template #header>
              <div class="card-header">
                <h3>О команде</h3>
                <el-icon><InfoFilled /></el-icon>
              </div>
            </template>
            <p class="team-description">{{ team?.description }}</p>
          </el-card>

          <!-- Детали команды -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>Детали команды</h3>
                <el-icon><Setting /></el-icon>
              </div>
            </template>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-icon">
                  <el-icon><Monitor /></el-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Режимы игры</span>
                  <div class="detail-value">
                    <el-tag
                      v-for="mode in team?.game_modes"
                      :key="mode"
                      class="game-mode-tag"
                    >
                      {{ getGameModeLabel(mode) }}
                    </el-tag>
                    <span v-if="!team?.game_modes?.length" class="no-data">Не указаны</span>
                  </div>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <el-icon><Avatar /></el-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Ищут игроков на роли</span>
                  <div class="detail-value">
                    <el-tag
                      v-for="role in team?.required_roles"
                      :key="role"
                      type="warning"
                      class="role-tag"
                    >
                      {{ getRoleLabel(role) }}
                    </el-tag>
                    <span v-if="!team?.required_roles?.length" class="no-data">Не указаны</span>
                  </div>
                </div>
              </div>

              <div class="detail-item">
                <div class="detail-icon">
                  <el-icon><PriceTag /></el-icon>
                </div>
                <div class="detail-content">
                  <span class="detail-label">Теги</span>
                  <div class="detail-value">
                    <el-tag
                      v-for="tag in team?.tags"
                      :key="tag"
                      type="info"
                      class="tag-tag"
                    >
                      {{ tag }}
                    </el-tag>
                    <span v-if="!team?.tags?.length" class="no-data">Не указаны</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Участники команды -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <h3>Участники команды</h3>
                <el-icon><UserFilled /></el-icon>
              </div>
            </template>
            
            <div class="members-grid">
              <div
                v-for="member in team?.members"
                :key="member.id"
                class="member-card"
                @click="$router.push(`/users/${member.id}`)"
              >
                <div class="member-avatar">
                  <el-avatar :size="60" :src="member.avatar_url" />
                  <div 
                    v-if="isUserOnline(member.last_online)" 
                    class="online-indicator"
                  ></div>
                </div>
                <div class="member-info">
                  <h4 class="member-name">
                    {{ member.username }}
                    <el-tag 
                      v-if="member.id === team?.captain.id" 
                      size="small" 
                      class="captain-badge"
                    >
                      Капитан
                    </el-tag>
                  </h4>
                  <p class="member-mmr">
                    MMR: {{ member.mmr_rating || 'Не указан' }}
                  </p>
                  <div class="member-roles">
                    <el-tag
                      v-for="role in member.preferred_roles"
                      :key="role"
                      size="small"
                      class="member-role-tag"
                    >
                      {{ getRoleLabel(role) }}
                    </el-tag>
                  </div>
                </div>
                <div class="member-actions">
                  <el-button
                    type="primary"
                    text
                    @click.stop="startChat(member.id)"
                    :disabled="member.id === authStore.user?.id"
                    class="chat-btn"
                  >
                    <el-icon><ChatDotRound /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Правая колонка - дополнительная информация -->
        <div class="sidebar-column">
          <!-- Статистика команды -->
          <el-card class="stats-card">
            <template #header>
              <div class="card-header">
                <h3>Статистика</h3>
                <el-icon><DataAnalysis /></el-icon>
              </div>
            </template>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ team?.members?.length || 0 }}/5</div>
                <div class="stat-label">Участников</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ onlineMembersCount }}</div>
                <div class="stat-label">Online</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ averageMMR }}</div>
                <div class="stat-label">Средний MMR</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ creationDate }}</div>
                <div class="stat-label">Создана</div>
              </div>
            </div>
          </el-card>

          <!-- Капитан команды -->
          <el-card class="captain-card" v-if="team?.captain">
            <template #header>
              <div class="card-header">
                <h3>Капитан</h3>
                <el-icon><Trophy /></el-icon>
              </div>
            </template>
            
            <div 
              class="captain-info"
              @click="$router.push(`/users/${team?.captain.id}`)"
            >
              <el-avatar :size="80" :src="team?.captain.avatar_url" />
              <div class="captain-details">
                <h4 class="captain-name">{{ team?.captain.username }}</h4>
                <p class="captain-mmr">MMR: {{ team?.captain.mmr_rating || 'Не указан' }}</p>
                <p class="captain-region">{{ getRegionLabel(team?.captain.region) }}</p>
              </div>
            </div>
            
            <div class="captain-actions">
              <el-button
                type="primary"
                @click="startChat(team?.captain.id)"
                :disabled="team?.captain.id === authStore.user?.id"
                class="full-width-btn"
              >
                <el-icon><ChatDotRound /></el-icon>
                Написать капитану
              </el-button>
            </div>
          </el-card>

          <!-- Похожие команды -->
          <el-card class="similar-teams-card" v-if="similarTeams.length > 0">
            <template #header>
              <div class="card-header">
                <h3>Похожие команды</h3>
                <el-icon><Connection /></el-icon>
              </div>
            </template>
            
            <div class="similar-teams-list">
              <div
                v-for="similarTeam in similarTeams"
                :key="similarTeam.id"
                class="similar-team-item"
                @click="$router.push(`/teams/${similarTeam.id}`)"
              >
                <el-avatar :size="40" :src="similarTeam.avatar_url" />
                <div class="similar-team-info">
                  <h5 class="similar-team-name">{{ similarTeam.name }}</h5>
                  <p class="similar-team-mmr">
                    MMR: {{ similarTeam.mmr_range_min }} - {{ similarTeam.mmr_range_max }}
                  </p>
                </div>
                <el-tag 
                  v-if="similarTeam.is_searching" 
                  size="small" 
                  type="success"
                >
                  В поиске
                </el-tag>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- Диалог подачи заявки -->
    <el-dialog
      v-model="applyDialogVisible"
      title="Подать заявку в команду"
      width="500px"
      class="application-dialog"
    >
      <el-form :model="applicationForm">
        <el-form-item label="Сообщение">
          <el-input
            v-model="applicationForm.message"
            type="textarea"
            :rows="4"
            placeholder="Расскажите о себе и почему хотите присоединиться к команде"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">Отмена</el-button>
        <el-button 
          type="primary" 
          @click="submitApplication" 
          :loading="applying"
          class="submit-btn"
        >
          Отправить заявку
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { useApplicationsStore } from '../stores/applications'
import { useChatStore } from '../stores/chat'
import { useUsersStore } from '../stores/users'
import { REGIONS, GAME_MODES, ROLES } from '../utils/constants'
import { ElMessage } from 'element-plus'

import {
  Location,
  User,
  Trophy,
  Search,
  Star,
  DocumentAdd,
  ChatDotRound,
  InfoFilled,
  Setting,
  Monitor,
  Avatar,
  PriceTag,
  UserFilled,
  DataAnalysis,
  Connection
} from '@element-plus/icons-vue'

export default {
  name: 'TeamDetail',
  components: {
    Location,
    User,
    Search,
    Star,
    DocumentAdd,
    ChatDotRound,
    InfoFilled,
    Setting,
    Monitor,
    Avatar,
    PriceTag,
    UserFilled,
    DataAnalysis,
    Trophy,
    Connection
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const teamsStore = useTeamsStore()
    const applicationsStore = useApplicationsStore()
    const chatStore = useChatStore()
    const usersStore = useUsersStore()

    const team = ref(null)
    const loading = ref(true)
    const applyDialogVisible = ref(false)
    const applying = ref(false)
    const similarTeams = ref([])

    const applicationForm = ref({
      message: ''
    })

    const heroStyle = computed(() => ({
      background: team?.value?.avatar_url 
        ? `linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), url('${team.value.avatar_url}') center/cover`
        : 'var(--primary-gradient)'
    }))

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

    const isUserOnline = (lastOnline) => {
      if (!lastOnline) return false
      const lastOnlineDate = new Date(lastOnline)
      const now = new Date()
      return (now - lastOnlineDate) < 5 * 60 * 1000 // 5 минут
    }

    const onlineMembersCount = computed(() => {
      return team.value?.members?.filter(member => isUserOnline(member.last_online)).length || 0
    })

    const averageMMR = computed(() => {
      const membersWithMMR = team.value?.members?.filter(member => member.mmr_rating) || []
      if (membersWithMMR.length === 0) return 'Нет данных'
      
      const totalMMR = membersWithMMR.reduce((sum, member) => sum + member.mmr_rating, 0)
      return Math.round(totalMMR / membersWithMMR.length)
    })

    const creationDate = computed(() => {
      if (!team.value?.createdAt) return 'Неизвестно'
      return new Date(team.value.createdAt).toLocaleDateString('ru-RU')
    })

    const loadTeam = async () => {
      const teamId = route.params.id
      try {
        team.value = await teamsStore.getTeam(teamId)
        await loadSimilarTeams()
      } catch (error) {
        ElMessage.error('Ошибка загрузки информации о команде')
        router.push('/teams')
      } finally {
        loading.value = false
      }
    }

    const loadSimilarTeams = async () => {
      try {
        const similar = await teamsStore.searchTeams({
          region: team.value.region,
          game_modes: team.value.game_modes,
          limit: 3
        })
        similarTeams.value = similar.filter(t => t.id !== team.value.id)
      } catch (error) {
        console.error('Error loading similar teams:', error)
      }
    }

    const applyToTeam = () => {
      if (authStore.user?.team_id) {
        ElMessage.warning('Вы уже состоите в команде. Пожалуйста, покиньте текущую команду перед подачей заявки.')
        return
      }
      applicationForm.value.message = ''
      applyDialogVisible.value = true
    }

    const submitApplication = async () => {
      applying.value = true
      try {
        await applicationsStore.applyToTeam(team.value.id, applicationForm.value)
        applyDialogVisible.value = false
        ElMessage.success('Заявка отправлена успешно!')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки заявки')
      } finally {
        applying.value = false
      }
    }

    const contactForScrim = () => {
      if (team.value.captain_id) {
        startChat(team.value.captain_id)
      }
    }

    const startChat = async (userId) => {
      try {
        const room = await chatStore.getOrCreatePrivateRoom(userId)
        chatStore.setActiveRoom(room.id)
        router.push('/chat')
      } catch (error) {
        ElMessage.error('Ошибка создания чата')
      }
    }

    onMounted(() => {
      loadTeam()
    })

    return {
      authStore,
      team,
      loading,
      applyDialogVisible,
      applying,
      similarTeams,
      applicationForm,
      heroStyle,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      isUserOnline,
      onlineMembersCount,
      averageMMR,
      creationDate,
      applyToTeam,
      submitApplication,
      contactForScrim,
      startChat
    }
  }
}
</script>

<style scoped>
.team-detail-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero секция */
.team-hero {
  position: relative;
  padding: 80px 20px;
  color: white;
  background: var(--primary-gradient);
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.team-basic-info {
  display: flex;
  align-items: center;
  gap: 30px;
}

.team-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
}

.team-main-info {
  flex: 1;
}

.team-name {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.team-meta {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  opacity: 0.9;
}

.team-status-badges {
  display: flex;
  gap: 10px;
}

.status-badge {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  font-weight: 600;
  padding: 15px 25px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Основной контент */
.team-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

/* Карточки */
.info-card,
.stats-card,
.captain-card,
.similar-teams-card {
  background: var(--bg-card);
  border: none;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  margin-bottom: 24px;
}

.info-card:hover,
.stats-card:hover,
.captain-card:hover,
.similar-teams-card:hover {
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
  font-size: 1.3rem;
  font-weight: 600;
}

.card-header .el-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
}

/* Описание команды */
.team-description {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 1.1rem;
  margin: 0;
}

/* Детали команды */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
}

.detail-item:hover {
  background: var(--border-color);
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-gradient);
  border-radius: var(--border-radius);
  color: white;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-label {
  display: block;
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-value {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.game-mode-tag,
.role-tag,
.tag-tag {
  border: none;
  font-weight: 500;
}

.game-mode-tag {
  background: var(--success-gradient);
  color: white;
}

.role-tag {
  background: var(--warning-gradient);
  color: white;
}

.tag-tag {
  background: var(--secondary-gradient);
  color: white;
}

.no-data {
  color: var(--text-muted);
  font-style: italic;
}

/* Участники команды */
.members-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

.member-card:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: var(--shadow-sm);
}

.member-avatar {
  position: relative;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--el-color-success);
  border: 2px solid white;
  border-radius: 50%;
}

.member-info {
  flex: 1;
}

.member-name {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.captain-badge {
  background: var(--warning-gradient);
  color: white;
  border: none;
}

.member-mmr {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.member-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.member-role-tag {
  background: var(--primary-color);
  color: white;
  border: none;
  font-size: 0.8rem;
}

.member-actions {
  flex-shrink: 0;
}

.chat-btn {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.chat-btn:hover {
  color: var(--primary-dark);
  transform: scale(1.1);
}

/* Статистика */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  transition: transform var(--transition-fast);
}

.stat-item:hover {
  transform: scale(1.05);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Капитан */
.captain-info {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background-color var(--transition-fast);
  margin-bottom: 20px;
}

.captain-info:hover {
  background: var(--border-color);
}

.captain-details {
  flex: 1;
}

.captain-name {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.captain-mmr,
.captain-region {
  margin: 4px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.captain-actions {
  display: flex;
  gap: 10px;
}

.full-width-btn {
  width: 100%;
  justify-content: center;
}

/* Похожие команды */
.similar-teams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.similar-team-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.similar-team-item:hover {
  background: var(--border-color);
  transform: translateX(3px);
}

.similar-team-info {
  flex: 1;
}

.similar-team-name {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.similar-team-mmr {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Диалог заявки */
.application-dialog {
  border-radius: var(--border-radius-lg);
}

.application-dialog .el-dialog__header {
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  margin: 0;
  padding: 20px;
}

.application-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
}

.submit-btn {
  background: var(--primary-gradient);
  border: none;
  padding: 10px 25px;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .sidebar-column {
    order: -1;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
  
  .team-basic-info {
    flex-direction: column;
    gap: 20px;
  }
  
  .team-name {
    font-size: 2.5rem;
  }
  
  .team-meta {
    flex-direction: column;
    gap: 15px;
  }
  
  .hero-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .member-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .member-name {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .team-hero {
    padding: 60px 15px;
  }
  
  .team-content {
    padding: 20px 15px;
  }
  
  .team-name {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>