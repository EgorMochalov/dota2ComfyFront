<template>
  <div class="my-team-page">
    <!-- Лоадер -->
    <div v-if="loading" class="loading-container">
      <div class="loader-content">
        <el-icon class="is-loading loader-icon"><Loading /></el-icon>
        <p>Загрузка информации о команде...</p>
      </div>
    </div>

    <!-- Hero Section -->
    <div v-else-if="currentTeam" class="team-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="team-identity">
          <div class="avatar-section">
            <div class="avatar-container">
              <el-avatar :size="120" :src="currentTeam.avatar_url ? currentTeam.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" class="team-avatar" />
              <div class="avatar-overlay" v-if="isCaptain">
                <el-upload
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :http-request="handleTeamAvatarUpload"
                  accept="image/jpeg,image/png,image/webp"
                >
                  <el-button type="primary" circle :loading="uploadingAvatar">
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
          <div class="team-info">
            <h1 class="team-name">{{ currentTeam.name }}</h1>
            <p class="team-description">{{ currentTeam.description || 'Команда Dota 2' }}</p>
            <div class="team-meta">
              <div class="meta-item">
                <el-icon><Location /></el-icon>
                <span>{{ getRegionLabel(currentTeam.region) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Rank /></el-icon>
                <span>{{ currentTeam.mmr_range_min }} - {{ currentTeam.mmr_range_max }} MMR</span>
              </div>
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ currentTeam.members?.length || 0 }}/5 участников</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="team-actions">
          <el-button 
            v-if="isCaptain" 
            type="primary" 
            @click="editTeamDialog = true"
            class="action-btn"
          >
            <el-icon><EditPen /></el-icon>
            Редактировать
          </el-button>
          <el-button 
            v-if="isCaptain" 
            type="danger" 
            @click="deleteTeamDialog = true"
            class="action-btn"
          >
            <el-icon><Delete /></el-icon>
            Удалить
          </el-button>
          <el-button 
            v-else 
            type="danger" 
            @click="leaveTeamDialog = true"
            class="action-btn"
          >
            <el-icon><Close /></el-icon>
            Покинуть
          </el-button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && currentTeam" class="team-main">
      <div class="container">
        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stat-card" @click="activeTab = 'members'">
            <div class="stat-icon members">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ currentTeam.members?.length || 0 }}</div>
              <div class="stat-label">Участников</div>
            </div>
          </div>
          
          <div class="stat-card" @click="activeTab = 'applications'" v-if="isCaptain">
            <div class="stat-icon applications">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ applicationsCount }}</div>
              <div class="stat-label">Заявок</div>
            </div>
          </div>
          
          <div class="stat-card" @click="activeTab = 'stats'">
            <div class="stat-icon stats">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ averageMMR }}</div>
              <div class="stat-label">Средний MMR</div>
            </div>
          </div>
          
          <div class="status-toggle" v-if="isCaptain">
            <div class="toggle-item">
              <el-switch
                v-model="currentTeam.is_searching"
                @change="updateTeamSearchStatus"
                :loading="updatingSearchStatus"
                active-text="В поиске"
                inactive-text="Не ищем"
              />
            </div>
            <div class="toggle-item">
              <el-switch
                v-model="currentTeam.looking_for_scrim"
                @change="updateTeamScrimStatus"
                :loading="updatingScrimStatus"
                active-text="Ищем кв"
                inactive-text="Не ищем кв"
              />
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="team-navigation">
          <el-tabs v-model="activeTab" class="team-tabs">
            <el-tab-pane label="Участники" name="members">
              <TeamMembers 
                :team="currentTeam" 
                :is-captain="isCaptain"
                @member-removed="handleMemberRemoved"
                @captain-transferred="handleCaptainTransferred"
              />
            </el-tab-pane>

            <el-tab-pane v-if="isCaptain" label="Заявки" name="applications">
              <TeamApplications :team-id="currentTeam.id" @applications-updated="handleApplicationsUpdated" />
            </el-tab-pane>

            <el-tab-pane label="Статистика" name="stats">
              <TeamStats :team="currentTeam" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- No Team State -->
    <div v-else-if="!loading && !currentTeam" class="no-team-state">
      <div class="empty-state">
        <div class="empty-icon">
          <el-icon><Mouse /></el-icon>
        </div>
        <h2>У вас нет команды</h2>
        <p>Создайте команду или присоединитесь к существующей</p>
        <div class="empty-actions">
          <el-button type="primary" @click="$router.push('/teams?create=true')" size="large">
            Создать команду
          </el-button>
          <el-button @click="$router.push('/teams')" size="large">
            Найти команду
          </el-button>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <TeamEditDialog
      v-model="editTeamDialog"
      :team="currentTeam"
      @saved="handleTeamUpdated"
      @closed="editTeamDialog = false"
    />

    <el-dialog
      v-model="deleteTeamDialog"
      title="Удалить команду"
      width="400px"
      class="danger-dialog"
    >
      <div class="dialog-content">
        <el-icon color="#f56c6c" size="48"><Warning /></el-icon>
        <h3>Вы уверены, что хотите удалить команду?</h3>
        <p>Это действие нельзя отменить. Все данные команды будут безвозвратно удалены.</p>
      </div>
      <template #footer>
        <el-button @click="deleteTeamDialog = false">Отмена</el-button>
        <el-button type="danger" @click="confirmDeleteTeam" :loading="deletingTeam">
          Удалить команду
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="leaveTeamDialog"
      title="Покинуть команду"
      width="400px"
      class="danger-dialog"
    >
      <div class="dialog-content">
        <el-icon color="#e6a23c" size="48"><InfoFilled /></el-icon>
        <h3>Покинуть команду?</h3>
        <p>Вы уверены, что хотите покинуть команду? Вы сможете присоединиться к другой команде позже.</p>
      </div>
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
import { useApplicationsStore } from '../stores/applications'
import { REGIONS } from '../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

// Icons
import {
  Camera,
  Location,
  Rank,
  User,
  EditPen,
  Delete,
  Close,
  Document,
  DataAnalysis,
  Mouse,
  Warning,
  InfoFilled,
  Loading
} from '@element-plus/icons-vue'

// Components
import TeamMembers from '../components/Teams/TeamMembers.vue'
import TeamApplications from '../components/Teams/TeamApplications.vue'
import TeamInvitations from '../components/Teams/TeamInvitations.vue'
import TeamStats from '../components/Teams/TeamStats.vue'
import TeamEditDialog from '../components/Teams/TeamEditDialog.vue'

export default {
  name: 'MyTeam',
  components: {
    Camera,
    Location,
    Rank,
    User,
    EditPen,
    Delete,
    Close,
    Document,
    DataAnalysis,
    Mouse,
    Warning,
    InfoFilled,
    Loading,
    TeamMembers,
    TeamApplications,
    TeamInvitations,
    TeamStats,
    TeamEditDialog
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const teamsStore = useTeamsStore()
    const applicationsStore = useApplicationsStore()

    const currentTeam = ref(null)
    const loading = ref(true)
    const activeTab = ref('members')
    const applicationsCount = ref(0)

    const editTeamDialog = ref(false)
    const deleteTeamDialog = ref(false)
    const leaveTeamDialog = ref(false)

    const uploadingAvatar = ref(false)
    const deletingTeam = ref(false)
    const leavingTeam = ref(false)
    const updatingSearchStatus = ref(false)
    const updatingScrimStatus = ref(false)

    const isCaptain = computed(() => {
      return currentTeam.value && authStore.user && currentTeam.value.captain.id === authStore.user.id
    })

    const averageMMR = computed(() => {
      const membersWithMMR = currentTeam.value?.members?.filter(member => member.mmr_rating) || []
      if (membersWithMMR.length === 0) return 0
      
      const totalMMR = membersWithMMR.reduce((sum, member) => sum + member.mmr_rating, 0)
      return Math.round(totalMMR / membersWithMMR.length)
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const loadTeamData = async () => {
      if (!authStore.user?.team_id) {
        loading.value = false
        return
      }

      try {
        currentTeam.value = await teamsStore.getTeam(authStore.user.team_id)
        if (isCaptain.value) {
          await loadApplicationsCount()
        }
      } catch (error) {
        ElMessage.error('Ошибка загрузки данных команды')
      } finally {
        loading.value = false
      }
    }

    const loadApplicationsCount = async () => {
      try {
        await applicationsStore.getTeamApplications(currentTeam.value.id)
        applicationsCount.value = applicationsStore.teamApplications.length
      } catch (error) {
        console.error('Error loading applications count:', error)
      }
    }

    const beforeAvatarUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('Аватар должен быть изображением!')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('Размер изображения не должен превышать 5MB!')
        return false
      }
      return true
    }

    const handleTeamAvatarUpload = async (options) => {
      uploadingAvatar.value = true
      try {
        const formData = new FormData()
        formData.append('avatar', options.file)
        await teamsStore.uploadTeamAvatar(currentTeam.value.id, formData)
        await loadTeamData()
        ElMessage.success('Аватар команды успешно обновлен!')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        uploadingAvatar.value = false
      }
    }

    const updateTeamSearchStatus = async (value) => {
      updatingSearchStatus.value = true
      try {
        await teamsStore.updateSearchStatus(currentTeam.value.id, { is_searching: value })
        ElMessage.success('Статус поиска обновлен')
      } catch (error) {
        currentTeam.value.is_searching = !value
        ElMessage.error('Ошибка обновления статуса поиска')
      } finally {
        updatingSearchStatus.value = false
      }
    }

    const updateTeamScrimStatus = async (value) => {
      updatingScrimStatus.value = true
      try {
        await teamsStore.updateScrimStatus(currentTeam.value.id, { looking_for_scrim: value })
        ElMessage.success('Статус поиска кв обновлен')
      } catch (error) {
        currentTeam.value.looking_for_scrim = !value
        ElMessage.error('Ошибка обновления статуса поиска кв')
      } finally {
        updatingScrimStatus.value = false
      }
    }

    const confirmDeleteTeam = async () => {
      deletingTeam.value = true
      try {
        await teamsStore.deleteTeam(currentTeam.value.id)
        deleteTeamDialog.value = false
        currentTeam.value = null
        await authStore.getCurrentUser()
        ElMessage.success('Команда удалена')
      } catch (error) {
        ElMessage.error('Ошибка удаления команды')
      } finally {
        deletingTeam.value = false
      }
    }

    const confirmLeaveTeam = async () => {
      leavingTeam.value = true
      try {
        await teamsStore.leaveTeam(currentTeam.value.id)
        leaveTeamDialog.value = false
        currentTeam.value = null
        await authStore.getCurrentUser()
        ElMessage.success('Вы покинули команду')
      } catch (error) {
        ElMessage.error('Ошибка выхода из команды')
      } finally {
        leavingTeam.value = false
      }
    }

    const handleMemberRemoved = async () => {
      await loadTeamData()
    }

    const handleCaptainTransferred = async () => {
      await loadTeamData()
      await authStore.getCurrentUser()
    }

    const handleApplicationsUpdated = (count) => {
      applicationsCount.value = count
    }

    const handleTeamUpdated = async () => {
      await loadTeamData()
      editTeamDialog.value = false
    }

    onMounted(() => {
      loadTeamData()
    })

    return {
      authStore,
      currentTeam,
      loading,
      activeTab,
      applicationsCount,
      editTeamDialog,
      deleteTeamDialog,
      leaveTeamDialog,
      uploadingAvatar,
      deletingTeam,
      leavingTeam,
      updatingSearchStatus,
      updatingScrimStatus,
      isCaptain,
      averageMMR,
      getRegionLabel,
      loadTeamData,
      beforeAvatarUpload,
      handleTeamAvatarUpload,
      updateTeamSearchStatus,
      updateTeamScrimStatus,
      confirmDeleteTeam,
      confirmLeaveTeam,
      handleMemberRemoved,
      handleCaptainTransferred,
      handleApplicationsUpdated,
      handleTeamUpdated
    }
  }
}
</script>

<style scoped>
.my-team-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Лоадер */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.loader-content {
  text-align: center;
  color: var(--text-secondary);
}

.loader-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  color: var(--primary-color);
}

.loader-content p {
  font-size: 1.1rem;
  margin: 0;
}

/* Hero Section */
.team-hero {
  position: relative;
  background: var(--primary-gradient);
  color: white;
  padding: 60px 0 40px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.05)" points="0,1000 1000,0 1000,1000"/></svg>');
  background-size: cover;
}

.hero-content {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.team-identity {
  display: flex;
  align-items: center;
  gap: 30px;
  flex: 1;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  transition: all var(--transition-normal);
}

.team-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--shadow-xl);
}

.avatar-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 1;
  transition: all var(--transition-normal);
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  line-height: 1.2;
}

.team-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 20px;
  max-width: 500px;
  word-wrap: break-word;
}

.team-meta {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  opacity: 0.8;
  flex-shrink: 0;
}

.team-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Main Content */
.team-main {
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.stat-icon.members {
  background: var(--success-gradient);
}

.stat-icon.applications {
  background: var(--warning-gradient);
}

.stat-icon.stats {
  background: var(--primary-gradient);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.status-toggle {
  grid-column: 1 / -1;
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  gap: 30px;
  align-items: center;
  flex-wrap: wrap;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 200px;
}

/* Navigation */
.team-navigation {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.team-tabs {
  padding: 0;
}

:deep(.team-tabs .el-tabs__header) {
  background: linear-gradient(135deg, #f8fafc 0%, var(--bg-card) 100%);
  padding: 0 24px;
  margin: 0;
}

:deep(.team-tabs .el-tabs__nav-wrap) {
  padding-bottom: 0;
}

:deep(.team-tabs .el-tabs__item) {
  padding: 20px 24px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

:deep(.team-tabs .el-tabs__item:hover) {
  color: var(--primary-color);
}

:deep(.team-tabs .el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.team-tabs .el-tabs__active-bar) {
  background: var(--primary-gradient);
  height: 3px;
}

/* No Team State */
.no-team-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.empty-state {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  background: var(--primary-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  font-size: 48px;
  color: white;
}

.empty-state h2 {
  font-size: 1.8rem;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-muted);
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Dialogs */
:deep(.danger-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%);
}

.dialog-content {
  text-align: center;
  padding: 20px 0;
}

.dialog-content h3 {
  margin: 16px 0 8px;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.dialog-content p {
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Адаптивность */
@media (max-width: 1200px) {
  .hero-content {
    max-width: 100%;
    padding: 0 24px;
  }
  
  .container {
    max-width: 100%;
    padding: 0 24px;
  }
}

@media (max-width: 992px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
    padding: 0 20px;
  }

  .team-identity {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }

  .team-info {
    text-align: center;
  }

  .team-meta {
    justify-content: center;
  }

  .team-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .team-hero {
    padding: 40px 0 30px;
  }
  
  .team-name {
    font-size: 2rem;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .status-toggle {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    padding: 20px;
  }
  
  .toggle-item {
    min-width: auto;
    justify-content: space-between;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .team-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .loading-container {
    padding: 30px 16px;
    min-height: 50vh;
  }
}

@media (max-width: 576px) {
  .team-hero {
    padding: 30px 0 25px;
  }
  
  .hero-content {
    padding: 0 16px;
    gap: 24px;
  }
  
  .team-name {
    font-size: 1.8rem;
  }
  
  .team-description {
    font-size: 1rem;
  }
  
  .team-meta {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  :deep(.team-tabs .el-tabs__header) {
    padding: 0 16px;
  }
  
  :deep(.team-tabs .el-tabs__item) {
    padding: 16px 20px;
    font-size: 0.9rem;
  }
  
  .no-team-state {
    padding: 30px 16px;
  }
  
  .empty-icon {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }
  
  .empty-state h2 {
    font-size: 1.5rem;
  }
  
  .loader-icon {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .team-hero {
    padding: 25px 0 20px;
  }
  
  .hero-content {
    padding: 0 12px;
  }
  
  .team-name {
    font-size: 1.6rem;
  }
  
  .team-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .container {
    padding: 0 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .status-toggle {
    padding: 16px;
  }
  
  .toggle-item {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  :deep(.team-tabs .el-tabs__item) {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
  
  .loading-container {
    padding: 20px 12px;
  }
  
  .loader-icon {
    font-size: 2rem;
  }
  
  .loader-content p {
    font-size: 1rem;
  }
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .stat-card,
  .action-btn,
  .team-avatar,
  .avatar-overlay {
    transition: none;
  }
  
  .stat-card:hover,
  .action-btn:hover {
    transform: none;
  }
}

/* Исправление выхода за экран */
.my-team-page,
.team-hero,
.team-main,
.hero-content,
.container {
  max-width: 100%;
  overflow-x: hidden;
}

.team-identity,
.team-meta,
.team-actions,
.quick-stats {
  max-width: 100%;
}

/* Улучшение скролла на мобильных */
@media (max-width: 768px) {
  .my-team-page {
    -webkit-overflow-scrolling: touch;
  }
}

/* Улучшение отображения текста */
.team-name,
.team-description,
.stat-value,
.stat-label {
  word-break: break-word;
}

/* Адаптивность для очень маленьких экранов */
@media (max-width: 360px) {
  .team-name {
    font-size: 1.4rem;
  }
  
  .team-description {
    font-size: 0.9rem;
  }
  
  .empty-icon {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }
  
  .empty-state h2 {
    font-size: 1.3rem;
  }
  
  .empty-state p {
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1.3rem;
  }
  
  :deep(.team-tabs .el-tabs__item) {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
}
</style>