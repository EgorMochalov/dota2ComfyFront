<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-content">
          <h1 class="hero-title">Найдите идеальных тиммейтов для Dota 2</h1>
          <p class="hero-subtitle">Присоединяйтесь к сообществу игроков, находите команды и участвуйте в клановых войнах</p>
          <div class="hero-actions">
            <el-button size="large" @click="$router.push('/players')" class="hero-btn">
              Найти игроков
              <el-icon class="ml-3"><Search /></el-icon>
            </el-button>
            <el-button size="large" @click="$router.push('/teams')" class="hero-btn secondary">
              Найти команды
              <el-icon class="ml-3"><Mouse /></el-icon>
            </el-button>
            <el-button v-if="!authStore.user?.team_id" size="large" @click="$router.push('/teams?create=true')" class="hero-btn outline">
              Создать команду
              <el-icon class="ml-3"><Plus /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="hero-graphics">
          <div class="floating-cards">
            <div class="card card-1">
              <el-avatar :size="60" src="/api/placeholder/60" />
              <span>Carry</span>
            </div>
            <div class="card card-2">
              <el-avatar :size="60" src="/api/placeholder/60" />
              <span>Mid</span>
            </div>
            <div class="card card-3">
              <el-avatar :size="60" src="/api/placeholder/60" />
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="container">
        <el-row :gutter="30">
          <el-col :xs="12" :sm="6" v-for="stat in stats" :key="stat.label">
            <div class="stat-card">
              <div class="stat-icon" :style="{ backgroundColor: stat.color }">
                <component :is="stat.icon" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- Recommended Players -->
          <div class="content-column main-column">
            <el-card class="featured-card">
              <template #header>
                <div class="card-header">
                  <h3>
                    <el-icon><Star /></el-icon>
                    Рекомендуемые игроки
                  </h3>
                  <el-button text @click="$router.push('/players')">
                    Все игроки
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </template>

              <div v-if="recommendedPlayers.length" class="players-grid">
                <div
                  v-for="player in recommendedPlayers"
                  :key="player.id"
                  class="player-card"
                >
                  <div class="player-header">
                    <div class="player-avatar">
                      <el-avatar :size="60" :src="player.avatar_url" />
                      <div class="online-indicator" v-if="isUserOnline(player.last_online)"></div>
                    </div>
                    <div class="player-info">
                      <h4 @click="$router.push(`/users/${player.id}`)" class="player-name">
                        {{ player.username }}
                      </h4>
                      <div class="player-mmr">
                        <el-icon><Trophy /></el-icon>
                        {{ player.mmr_rating || 'Не указан' }} MMR
                      </div>
                      <div class="player-region">
                        <el-icon><Location /></el-icon>
                        {{ getRegionLabel(player.region) }}
                      </div>
                    </div>
                  </div>

                  <div class="player-roles">
                    <el-tag
                      v-for="role in player.preferred_roles"
                      :key="role"
                      :type="getRoleType(role)"
                      size="small"
                      class="role-tag"
                    >
                      {{ getRoleLabel(role) }}
                    </el-tag>
                  </div>

                  <div class="player-actions">
                    <el-button
                      type="primary"
                      size="small"
                      circle
                      @click="startChat(player.id)"
                      :disabled="player.id === authStore.user?.id"
                    >
                      <el-icon><ChatDotRound /></el-icon>
                    </el-button>
                    <el-button
                      size="small"
                      circle
                      @click="$router.push(`/users/${player.id}`)"
                    >
                      <el-icon><View /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="Нет рекомендуемых игроков" />
            </el-card>

            <!-- Active Teams -->
            <el-card class="featured-card">
              <template #header>
                <div class="card-header">
                  <h3>
                    <el-icon><TrendCharts /></el-icon>
                    Активные команды
                  </h3>
                  <el-button text @click="$router.push('/teams')">
                    Все команды
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </template>

              <div v-if="activeTeams.length" class="teams-grid">
                <div
                  v-for="team in activeTeams"
                  :key="team.id"
                  class="team-card"
                >
                  <div class="team-header">
                    <el-avatar :size="50" :src="team.avatar_url" />
                    <div class="team-info">
                      <h4 @click="$router.push(`/teams/${team.id}`)" class="team-name">
                        {{ team.name }}
                      </h4>
                      <div class="team-mmr">
                        {{ team.mmr_range_min }} - {{ team.mmr_range_max }} MMR
                      </div>
                    </div>
                    <el-tag :type="team.is_searching ? 'success' : 'info'" size="small">
                      {{ team.is_searching ? 'В поиске' : 'Полная' }}
                    </el-tag>
                  </div>

                  <p class="team-description">{{ truncateText(team.description, 80) }}</p>

                  <div class="team-roles">
                    <span class="roles-label">Ищут:</span>
                    <div class="roles-list">
                      <el-tag
                        v-for="role in team.required_roles"
                        :key="role"
                        type="warning"
                        size="small"
                      >
                        {{ getRoleLabel(role) }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="team-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="applyToTeam(team)"
                      :disabled="authStore.user?.team_id || !team.is_searching"
                    >
                      Подать заявку
                    </el-button>
                    <el-button
                      size="small"
                      text
                      @click="$router.push(`/teams/${team.id}`)"
                    >
                      Подробнее
                    </el-button>
                  </div>
                </div>
              </div>
              <el-empty v-else description="Нет активных команд" />
            </el-card>
          </div>

          <!-- Sidebar -->
          <div class="content-column sidebar-column">
            <!-- My Team Card -->
            <el-card class="sidebar-card" v-if="authStore.user?.team_id">
              <template #header>
                <h3>Моя команда</h3>
              </template>

              <div class="my-team">
                <div class="team-preview">
                  <el-avatar :size="80" :src="currentTeam?.avatar_url" />
                  <div class="team-details">
                    <h4>{{ currentTeam?.name }}</h4>
                    <p>Участников: {{ currentTeam?.members?.length }}/5</p>
                    <el-tag :type="currentTeam?.is_searching ? 'success' : 'info'" size="small">
                      {{ currentTeam?.is_searching ? 'В поиске' : 'Не ищет' }}
                    </el-tag>
                  </div>
                </div>
                <div class="team-actions">
                  <el-button type="primary" @click="$router.push('/my-team')" class="full-width">
                    Управление командой
                  </el-button>
                  <el-button @click="leaveTeamDialog = true" class="full-width">
                    Покинуть команду
                  </el-button>
                </div>
              </div>
            </el-card>

            <!-- Quick Actions -->
            <el-card class="sidebar-card">
              <template #header>
                <h3>Быстрые действия</h3>
              </template>

              <div class="quick-actions">
                <el-button 
                  type="primary" 
                  class="action-btn" 
                  @click="$router.push('/players')"
                >
                  Поиск игроков
                  <el-icon><Search /></el-icon>
                </el-button>
                <el-button 
                  class="action-btn" 
                  @click="$router.push('/teams')"
                >
                  Поиск команд
                  <el-icon><Mouse /></el-icon>
                </el-button>
                <el-button 
                  class="action-btn" 
                  @click="$router.push('/chat')"
                >
                  Открыть чат
                  <el-icon><ChatDotRound /></el-icon>
                </el-button>
                <el-button 
                  v-if="!authStore.user?.team_id"
                  type="success" 
                  class="action-btn" 
                  @click="$router.push('/teams?create=true')"
                >
                  Создать команду
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </el-card>

            <!-- Scrim Finder -->
            <el-card class="sidebar-card scrim-finder">
              <template #header>
                <h3>
                  <el-icon><Trophy /></el-icon>
                  Поиск команд для кв
                </h3>
              </template>

              <div class="scrim-content">
                <p>Найдите команды для тренировочных матчей и клановых войн</p>
                <el-button 
                  type="warning" 
                  class="full-width" 
                  @click="searchScrims"
                  :loading="searchingScrims"
                >
                  Найти команды для кв
                </el-button>
                
                <div v-if="scrimResults.length" class="scrim-results">
                  <h5>Найдено команд: {{ scrimResults.length }}</h5>
                  <div class="scrim-teams">
                    <div
                      v-for="team in scrimResults.slice(0, 3)"
                      :key="team.id"
                      class="scrim-team"
                      @click="$router.push(`/teams/${team.id}`)"
                    >
                      <el-avatar :size="30" :src="team.avatar_url" />
                      <span>{{ team.name }}</span>
                      <el-tag size="small">{{ team.mmr_range_min }}-{{ team.mmr_range_max }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Application Dialog -->
    <el-dialog
      v-model="applyDialogVisible"
      title="Подать заявку в команду"
      width="500px"
      class="application-dialog"
    >
      <div class="dialog-team">
        <el-avatar :size="50" :src="selectedTeam?.avatar_url" />
        <div class="team-info">
          <h4>{{ selectedTeam?.name }}</h4>
          <p>{{ selectedTeam?.description }}</p>
        </div>
      </div>

      <el-form :model="applicationForm">
        <el-form-item label="Сообщение команде">
          <el-input
            v-model="applicationForm.message"
            type="textarea"
            :rows="4"
            placeholder="Расскажите о себе, вашем опыте и почему хотите присоединиться к команде..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">Отмена</el-button>
        <el-button type="primary" @click="submitApplication" :loading="applying">
          Отправить заявку
        </el-button>
      </template>
    </el-dialog>

    <!-- Leave Team Dialog -->
    <el-dialog
      v-model="leaveTeamDialog"
      title="Покинуть команду"
      width="400px"
    >
      <p>Вы уверены, что хотите покинуть команду "{{ currentTeam?.name }}"?</p>
      <template #footer>
        <el-button @click="leaveTeamDialog = false">Отмена</el-button>
        <el-button type="danger" @click="confirmLeaveTeam" :loading="leavingTeam">
          Покинуть команду
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { useUsersStore } from '../stores/users'
import { useApplicationsStore } from '../stores/applications'
import { REGIONS, ROLES } from '../utils/constants'
import { ElMessage } from 'element-plus'
import {
  Search,
  Mouse,
  Plus,
  Star,
  ArrowRight,
  Trophy,
  Location,
  ChatDotRound,
  View,
  TrendCharts,
  User,
  Message
} from '@element-plus/icons-vue'

export default {
  name: 'Home',
  components: {
    Search,
    Mouse,
    Plus,
    Star,
    ArrowRight,
    Trophy,
    Location,
    ChatDotRound,
    View,
    TrendCharts,
    User,
    Message
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const teamsStore = useTeamsStore()
    const usersStore = useUsersStore()
    const applicationsStore = useApplicationsStore()

    const stats = ref([
      { icon: User, label: 'Игроков онлайн', value: '1,247', color: '#3498db' },
      { icon: Mouse, label: 'Команд в поиске', value: '356', color: '#e74c3c' },
      { icon: Trophy, label: 'Сыграно матчей', value: '8,923', color: '#f39c12' },
      { icon: Star, label: 'Успешных команд', value: '234', color: '#27ae60' }
    ])

    const recommendedPlayers = ref([])
    const activeTeams = ref([])
    const currentTeam = ref(null)
    const scrimResults = ref([])
    
    const applyDialogVisible = ref(false)
    const leaveTeamDialog = ref(false)
    const selectedTeam = ref(null)
    const applying = ref(false)
    const leavingTeam = ref(false)
    const searchingScrims = ref(false)

    const applicationForm = ref({
      message: ''
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
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
      return (now - lastOnlineDate) < 5 * 60 * 1000
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const loadData = async () => {
      try {
        // Загрузка рекомендованных игроков
        const playersResponse = await usersStore.searchUsers({
          limit: 6,
          is_online: true
        })
        recommendedPlayers.value = playersResponse

        // Загрузка активных команд
        const teamsResponse = await teamsStore.searchTeams({
          limit: 6,
          is_searching: true
        })
        activeTeams.value = teamsResponse

        // Загрузка текущей команды
        if (authStore.user?.team_id) {
          currentTeam.value = await teamsStore.getTeam(authStore.user.team_id)
        }
      } catch (error) {
        console.error('Error loading home data:', error)
      }
    }

    const startChat = async (userId) => {
      try {
        const room = await usersStore.getOrCreatePrivateRoom(userId)
        usersStore.setActiveRoom(room.id)
        router.push('/chat')
      } catch (error) {
        ElMessage.error('Ошибка создания чата')
      }
    }

    const applyToTeam = (team) => {
      if (authStore.user?.team_id) {
        ElMessage.warning('Вы уже состоите в команде. Пожалуйста, покиньте текущую команду перед подачей заявки.')
        return
      }
      selectedTeam.value = team
      applicationForm.value.message = ''
      applyDialogVisible.value = true
    }

    const submitApplication = async () => {
      if (!selectedTeam.value) return

      applying.value = true
      try {
        await applicationsStore.applyToTeam(selectedTeam.value.id, applicationForm.value)
        ElMessage.success('Заявка отправлена успешно!')
        applyDialogVisible.value = false
        selectedTeam.value = null
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки заявки')
      } finally {
        applying.value = false
      }
    }

    const confirmLeaveTeam = async () => {
      leavingTeam.value = true
      try {
        await teamsStore.leaveTeam(authStore.user.team_id)
        currentTeam.value = null
        leaveTeamDialog.value = false
        ElMessage.success('Вы покинули команду')
      } catch (error) {
        ElMessage.error('Ошибка выхода из команды')
      } finally {
        leavingTeam.value = false
      }
    }

    const searchScrims = async () => {
      searchingScrims.value = true
      try {
        const results = await teamsStore.searchScrims({
          region: authStore.user?.region,
          limit: 5
        })
        scrimResults.value = results
        if (results.length === 0) {
          ElMessage.info('Команды для кв не найдены')
        }
      } catch (error) {
        ElMessage.error('Ошибка поиска команд для кв')
      } finally {
        searchingScrims.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      authStore,
      stats,
      recommendedPlayers,
      activeTeams,
      currentTeam,
      scrimResults,
      applyDialogVisible,
      leaveTeamDialog,
      applying,
      leavingTeam,
      searchingScrims,
      applicationForm,
      getRegionLabel,
      getRoleLabel,
      getRoleType,
      isUserOnline,
      truncateText,
      startChat,
      applyToTeam,
      submitApplication,
      confirmLeaveTeam,
      searchScrims
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero-background {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 60px;
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  background: linear-gradient(45deg, #fff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 20px;
  font-weight: 600;
  border-radius: 12px;
  border: 2px solid transparent;
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.hero-btn.outline {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
}

.hero-graphics {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.floating-cards {
  position: relative;
  width: 300px;
  height: 200px;
}

.card {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 600;
  animation: float 6s ease-in-out infinite;
}

.card-1 {
  top: 0;
  left: 0;
  animation-delay: 0s;
}

.card-2 {
  top: 40px;
  right: 0;
  animation-delay: 2s;
}

.card-3 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

/* Stats Section */
.stats-section {
  padding: 60px 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.stat-card {
  background: white;
  border-radius: 15px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e4e7ed;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
  font-size: 24px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Main Content */
.main-content {
  padding: 60px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.content-column.main-column {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.featured-card {
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.featured-card .el-card__header) {
  border-bottom: 1px solid #f0f2f5;
  padding: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2c3e50;
  font-size: 1.3rem;
}

/* Players Grid */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.player-card {
  background: white;
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.player-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.player-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.player-avatar {
  position: relative;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #27ae60;
  border: 2px solid white;
  border-radius: 50%;
}

.player-info {
  flex: 1;
}

.player-name {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s;
}

.player-name:hover {
  color: #3498db;
}

.player-mmr,
.player-region {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.player-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.role-tag {
  font-weight: 600;
}

.player-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Teams Grid */
.teams-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.team-card {
  background: white;
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.team-header {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 12px;
}

.team-name {
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s;
}

.team-name:hover {
  color: #3498db;
}

.team-mmr {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.team-description {
  color: #5a6c7d;
  line-height: 1.5;
  margin-bottom: 15px;
}

.team-roles {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.roles-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.roles-list {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.team-actions {
  display: flex;
  gap: 10px;
}

/* Sidebar */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sidebar-card {
  border-radius: 15px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

:deep(.sidebar-card .el-card__header) {
  border-bottom: 1px solid #f0f2f5;
  padding: 20px;
}

.sidebar-card h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

/* My Team */
.my-team {
  text-align: center;
}

.team-preview {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  text-align: left;
}

.team-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.team-details p {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.team-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-width {
  width: 100%;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  justify-content: flex-start;
  padding: 30px;
  border-radius: 10px;
  font-weight: 500;
}

/* Scrim Finder */
.scrim-finder {
  background: linear-gradient(135deg, #fef9e7 0%, #fef5e7 100%);
  border: 1px solid #f39c12;
}

.scrim-content {
  text-align: center;
}

.scrim-content p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.scrim-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

.scrim-results h5 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.scrim-teams {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scrim-team {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scrim-team:hover {
  border-color: #f39c12;
  transform: translateX(5px);
}

.scrim-team span {
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
}

/* Application Dialog */
.dialog-team {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.dialog-team h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.dialog-team p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .hero-background {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .players-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section .el-col-xs-12 {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }
  
  .hero-btn {
    width: 100%;
  }
  
  .team-preview {
    flex-direction: column;
    text-align: center;
  }
}
</style>