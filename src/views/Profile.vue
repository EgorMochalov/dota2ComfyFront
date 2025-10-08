<template>
  <div class="profile-page">
    <!-- Hero секция с градиентом -->
    <div class="profile-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="user-main-card">
          <div class="user-avatar-section">
            <div class="avatar-container">
              <el-avatar :size="120" :src="authStore.user?.avatar_url" fit="cover" />
              <div class="avatar-overlay">
                <el-upload
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
                  :http-request="handleAvatarUpload"
                  accept="image/jpeg,image/png,image/webp"
                >
                  <el-button type="primary" circle :loading="uploadingAvatar">
                    <el-icon><Camera /></el-icon>
                  </el-button>
                </el-upload>
              </div>
            </div>
          </div>
          
          <div class="user-basic-info">
            <h1 class="username">{{ authStore.user?.username }}</h1>
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ authStore.user?.mmr_rating || '0' }}</div>
                <div class="stat-label">MMR</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ getRegionLabel(authStore.user?.region) }}</div>
                <div class="stat-label">Регион</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">
                  <el-tag 
                    :type="authStore.user?.is_searching ? 'success' : 'info'" 
                    effect="dark"
                    class="status-tag"
                  >
                    {{ authStore.user?.is_searching ? 'В поиске' : 'Не в поиске' }}
                  </el-tag>
                </div>
                <div class="stat-label">Статус</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="content-grid">
        <!-- Левая колонка - Быстрая информация -->
        <!-- Центральная колонка - Настройки профиля -->
        <div class="center-column">
          <el-card class="settings-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h2>Настройки профиля</h2>
                <el-icon><Setting /></el-icon>
              </div>
            </template>

            <el-form
              :model="profileForm"
              :rules="profileRules"
              ref="profileFormRef"
              label-width="140px"
              label-position="left"
              @submit.prevent="handleUpdateProfile"
              class="profile-form"
            >
              <div class="form-section">
                <h3 class="section-title">Основная информация</h3>
                
                <el-form-item label="Имя" prop="username">
                  <el-input 
                    v-model="profileForm.username" 
                    placeholder="Введите имя пользователя"
                    size="large"
                  />
                </el-form-item>

                <el-form-item label="Регион" prop="region">
                  <el-select 
                    v-model="profileForm.region" 
                    placeholder="Выберите регион"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="region in REGIONS"
                      :key="region.value"
                      :label="region.label"
                      :value="region.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="MMR рейтинг" prop="mmr_rating">
                  <el-input-number
                    v-model="profileForm.mmr_rating"
                    :min="0"
                    :max="10000"
                    :step="100"
                    size="large"
                    controls-position="right"
                  />
                </el-form-item>
              </div>

              <div class="form-section">
                <h3 class="section-title">Игровые предпочтения</h3>
                
                <el-form-item label="Режимы игры" prop="game_modes">
                  <el-select
                    v-model="profileForm.game_modes"
                    multiple
                    placeholder="Выберите режимы игры"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="mode in GAME_MODES"
                      :key="mode.value"
                      :label="mode.label"
                      :value="mode.value"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="Предпочитаемые роли" prop="preferred_roles">
                  <el-select
                    v-model="profileForm.preferred_roles"
                    multiple
                    placeholder="Выберите роли"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="role in ROLES"
                      :key="role.value"
                      :label="role.label"
                      :value="role.value"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="form-section">
                <h3 class="section-title">О себе</h3>
                
                <el-form-item label="Описание" prop="about_me">
                  <el-input
                    v-model="profileForm.about_me"
                    type="textarea"
                    :rows="4"
                    placeholder="Расскажите о себе, вашем стиле игры, опыте и целях..."
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="Теги" prop="tags">
                  <el-select
                    v-model="profileForm.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="Добавьте теги, которые описывают ваш стиль игры"
                    size="large"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="tag in TAGS"
                      :key="tag"
                      :label="tag"
                      :value="tag"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <div class="form-actions">
                <el-button 
                  type="primary" 
                  size="large" 
                  :loading="updating" 
                  native-type="submit"
                  class="save-button"
                >
                  Сохранить изменения
                </el-button>
                <el-button 
                  @click="resetForm" 
                  size="large"
                  class="reset-button"
                >
                  Сбросить
                </el-button>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- Правая колонка - Дополнительная информация -->
        <div class="right-column">
          <!-- Карточка команды -->
          <el-card v-if="authStore.user?.team_id" class="info-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Моя команда</h3>
                <el-icon><Star /></el-icon>
              </div>
            </template>
            <div class="team-preview" @click="$router.push('/my-team')">
              <el-avatar :size="50" :src="currentTeam?.avatar_url" />
              <div class="team-info">
                <h4>{{ currentTeam?.name }}</h4>
                <p>{{ currentTeam?.members?.length || 0 }}/5 участников</p>
              </div>
              <el-icon class="team-arrow"><ArrowRight /></el-icon>
            </div>
          </el-card>
          <!-- Карточка игровых предпочтений -->
          <el-card class="preferences-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h3>Игровые предпочтения</h3>
                <el-icon><VideoPlay /></el-icon>
              </div>
            </template>
            <div class="preferences-content">
              <div class="preference-item" v-if="profileForm.game_modes.length">
                <strong>Режимы:</strong>
                <div class="tags-container">
                  <el-tag
                    v-for="mode in profileForm.game_modes"
                    :key="mode"
                    type="info"
                    size="small"
                    class="preference-tag"
                  >
                    {{ getGameModeLabel(mode) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="preference-item" v-if="profileForm.preferred_roles.length">
                <strong>Роли:</strong>
                <div class="tags-container">
                  <el-tag
                    v-for="role in profileForm.preferred_roles"
                    :key="role"
                    :type="getRoleType(role)"
                    size="small"
                    class="preference-tag"
                  >
                    {{ getRoleLabel(role) }}
                  </el-tag>
                </div>
              </div>

              <div class="preference-item" v-if="profileForm.tags.length">
                <strong>Теги:</strong>
                <div class="tags-container">
                  <el-tag
                    v-for="tag in profileForm.tags.slice(0, 5)"
                    :key="tag"
                    type="warning"
                    size="small"
                    class="preference-tag"
                  >
                    {{ tag }}
                  </el-tag>
                  <el-tag v-if="profileForm.tags.length > 5" size="small" type="info">
                    +{{ profileForm.tags.length - 5 }}
                  </el-tag>
                </div>
              </div>

              <div class="empty-state" v-if="!profileForm.game_modes.length && !profileForm.preferred_roles.length">
                <el-icon><InfoFilled /></el-icon>
                <p>Заполните информацию о игровых предпочтениях</p>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { useTeamsStore } from '../stores/teams'
import { REGIONS, GAME_MODES, ROLES, TAGS } from '../utils/constants'
import { ElMessage } from 'element-plus'
import {
  Camera,
  Opportunity,
  Star,
  DataAnalysis,
  Setting,
  Search,
  VideoPlay,
  Lightning,
  User,
  ChatDotRound,
  ArrowRight,
  InfoFilled
} from '@element-plus/icons-vue'

export default {
  name: 'Profile',
  components: {
    Camera,
    Opportunity,
    Star,
    DataAnalysis,
    Setting,
    Search,
    VideoPlay,
    Lightning,
    User,
    ChatDotRound,
    ArrowRight,
    InfoFilled
  },
  setup() {
    const authStore = useAuthStore()
    const usersStore = useUsersStore()
    const teamsStore = useTeamsStore()

    const profileFormRef = ref()
    const uploadingAvatar = ref(false)
    const updating = ref(false)
    const updatingSearchStatus = ref(false)
    const currentTeam = ref(null)

    const profileForm = ref({
      username: '',
      region: '',
      mmr_rating: null,
      game_modes: [],
      preferred_roles: [],
      about_me: '',
      tags: []
    })

    const isSearching = ref(authStore.user?.is_searching || false)

    const profileRules = {
      username: [
        { required: true, message: 'Пожалуйста, введите имя пользователя', trigger: 'blur' },
        { min: 3, message: 'Имя пользователя должно быть не менее 3 символов', trigger: 'blur' }
      ],
      region: [
        { required: true, message: 'Пожалуйста, выберите регион', trigger: 'change' }
      ]
    }

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

    const handleAvatarUpload = async (options) => {
      uploadingAvatar.value = true
      try {
        await usersStore.uploadAvatar(options.file)
        await authStore.getCurrentUser()
        ElMessage.success('Аватар успешно обновлен!')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        uploadingAvatar.value = false
      }
    }

    const handleUpdateProfile = async () => {
      if (!profileFormRef.value) return

      const valid = await profileFormRef.value.validate()
      if (!valid) return

      updating.value = true
      try {
        const updatedUser = await usersStore.updateProfile(profileForm.value)
        authStore.updateUser(updatedUser)
        ElMessage.success('Профиль успешно обновлен!')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        updating.value = false
      }
    }

    const updateSearchStatus = async (value) => {
      updatingSearchStatus.value = true
      try {
        await usersStore.updateSearchStatus({ is_searching: value })
        authStore.user.is_searching = value
        ElMessage.success(`Статус поиска обновлен: ${value ? 'В поиске' : 'Не в поиске'}`)
      } catch (error) {
        isSearching.value = !value
        ElMessage.error('Ошибка обновления статуса поиска')
      } finally {
        updatingSearchStatus.value = false
      }
    }

    const resetForm = () => {
      if (authStore.user) {
        profileForm.value = {
          username: authStore.user.username || '',
          region: authStore.user.region || '',
          mmr_rating: authStore.user.mmr_rating || null,
          game_modes: authStore.user.game_modes || [],
          preferred_roles: authStore.user.preferred_roles || [],
          about_me: authStore.user.about_me || '',
          tags: authStore.user.tags || []
        }
        isSearching.value = authStore.user.is_searching || false
      }
    }

    const loadTeamData = async () => {
      if (authStore.user?.team_id) {
        try {
          currentTeam.value = await teamsStore.getTeam(authStore.user.team_id)
        } catch (error) {
          console.error('Error loading team data:', error)
        }
      }
    }

    onMounted(() => {
      resetForm()
      loadTeamData()
    })

    return {
      authStore,
      REGIONS,
      GAME_MODES,
      ROLES,
      TAGS,
      profileFormRef,
      uploadingAvatar,
      updating,
      updatingSearchStatus,
      profileForm,
      isSearching,
      profileRules,
      currentTeam,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      getRoleType,
      beforeAvatarUpload,
      handleAvatarUpload,
      handleUpdateProfile,
      updateSearchStatus,
      resetForm
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Hero секция */
.profile-hero {
  position: relative;
  background: var(--primary-gradient);
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

.avatar-overlay {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.user-basic-info {
  flex: 1;
}

.username {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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

.status-tag {
  border: none;
  font-weight: 500;
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
  grid-template-columns:1fr 300px;
  gap: 24px;
  align-items: start;
}

/* Карточки */
.info-card,
.settings-card,
.status-card,
.preferences-card,
.actions-card {
  border: none;
  border-radius: var(--border-radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  margin-bottom: 24px;
}

.info-card:hover,
.settings-card:hover,
.status-card:hover,
.preferences-card:hover,
.actions-card:hover {
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

.card-header h2,
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
.status-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: var(--success-gradient);
}

.status-dot.active {
  background: var(--warning-gradient);
}

.team-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--border-radius);
  background: var(--bg-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.team-preview:hover {
  background: var(--primary-color);
  color: white;
}

.team-preview:hover .team-arrow {
  color: white;
}

.team-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
}

.team-info p {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.team-arrow {
  margin-left: auto;
  color: var(--text-muted);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.mini-stat {
  text-align: center;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
}

.mini-stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.mini-stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Центральная колонка */
.settings-card {
  grid-column: 2;
}

.profile-form {
  padding: 8px 0;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-left: 12px;
  border-left: 4px solid var(--primary-color);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-secondary);
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

:deep(.el-select .el-input__inner) {
  border-radius: var(--border-radius);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.save-button {
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 12px 24px;
}

.save-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.reset-button {
  border-radius: var(--border-radius);
  padding: 12px 24px;
}

/* Правая колонка */
.search-status-content {
  text-align: center;
}

.status-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-label {
  font-weight: 500;
  color: var(--text-primary);
}

.status-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.preferences-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference-item strong {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preference-tag {
  border: none;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}

.empty-state .el-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.actions-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  
  .user-stats {
    justify-content: center;
  }
  
  .username {
    font-size: 2rem;
  }
  
  .profile-content {
    margin-top: -20px;
    padding: 0 16px 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .user-stats {
    flex-direction: column;
    gap: 20px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>