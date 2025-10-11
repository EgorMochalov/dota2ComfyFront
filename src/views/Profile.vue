<template>
  <div class="profile-page">
    <!-- Hero секция с градиентом -->
    <div class="profile-hero">
      <div class="hero-background"></div>
      <div class="hero-content">
        <div class="user-main-card">
          <div class="user-avatar-section">
            <div class="avatar-container">
              <template v-if="!loadingAvatar">
                <el-avatar :size="120" :src="authStore.user?.avatar_url ? authStore.user?.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" fit="cover" />
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
              </template>
              <div v-else class="avatar-skeleton">
                <div class="skeleton-circle"></div>
              </div>
            </div>
          </div>
          
          <div class="user-basic-info">
            <template v-if="!loadingProfile">
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
            </template>
            <template v-else>
              <div class="username-skeleton">
                <div class="skeleton-line skeleton-title"></div>
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
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="profile-content">
      <div class="content-grid">
        <!-- Центральная колонка - Настройки профиля -->
        <div class="center-column">
          <el-card class="settings-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h2>Настройки профиля</h2>
                <el-icon><Setting /></el-icon>
              </div>
            </template>

            <div v-if="loadingProfile" class="form-skeleton">
              <div class="section-skeleton" v-for="i in 3" :key="i">
                <div class="skeleton-line skeleton-section-title"></div>
                <div class="fields-skeleton">
                  <div class="skeleton-field" v-for="j in 3" :key="j">
                    <div class="skeleton-line skeleton-label"></div>
                    <div class="skeleton-input"></div>
                  </div>
                </div>
              </div>
              <div class="actions-skeleton">
                <div class="skeleton-button skeleton-primary"></div>
                <div class="skeleton-button"></div>
              </div>
            </div>

            <el-form
              v-else
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

                <el-form-item label="MMR" prop="mmr_rating">
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
            <div v-if="loadingTeam" class="team-skeleton">
              <div class="skeleton-circle skeleton-avatar"></div>
              <div class="team-info-skeleton">
                <div class="skeleton-line skeleton-team-name"></div>
                <div class="skeleton-line skeleton-team-members"></div>
              </div>
            </div>
            <div v-else class="team-preview" @click="$router.push('/my-team')">
              <el-avatar :size="50" :src="currentTeam?.avatar_url ? currentTeam?.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" />
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
            <div v-if="loadingProfile" class="preferences-skeleton">
              <div class="preference-skeleton" v-for="i in 3" :key="i">
                <div class="skeleton-line skeleton-label-small"></div>
                <div class="tags-skeleton">
                  <div class="skeleton-tag" v-for="j in 3" :key="j"></div>
                </div>
              </div>
            </div>
            <div v-else class="preferences-content">
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
  Star,
  Setting,
  VideoPlay,
  User,
  ChatDotRound,
  ArrowRight,
  InfoFilled
} from '@element-plus/icons-vue'

export default {
  name: 'Profile',
  components: {
    Camera,
    Star,
    Setting,
    VideoPlay,
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
    const loadingProfile = ref(true)
    const loadingTeam = ref(false)
    const loadingAvatar = ref(false)
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
      loadingAvatar.value = true
      try {
        await usersStore.uploadAvatar(options.file)
        await authStore.getCurrentUser()
        ElMessage.success('Аватар успешно обновлен!')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        uploadingAvatar.value = false
        loadingAvatar.value = false
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
      }
    }

    const loadTeamData = async () => {
      if (authStore.user?.team_id) {
        loadingTeam.value = true
        try {
          currentTeam.value = await teamsStore.getTeam(authStore.user.team_id)
        } catch (error) {
          console.error('Error loading team data:', error)
        } finally {
          loadingTeam.value = false
        }
      }
    }

    const loadProfileData = async () => {
      loadingProfile.value = true
      try {
        await authStore.getCurrentUser()
        resetForm()
        await loadTeamData()
      } catch (error) {
        ElMessage.error('Ошибка загрузки профиля')
      } finally {
        loadingProfile.value = false
      }
    }

    onMounted(() => {
      loadProfileData()
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
      profileForm,
      profileRules,
      currentTeam,
      loadingProfile,
      loadingTeam,
      loadingAvatar,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      getRoleType,
      beforeAvatarUpload,
      handleAvatarUpload,
      handleUpdateProfile,
      resetForm
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--bg-primary);
  overflow-x: hidden;
}

/* Hero секция */
.profile-hero {
  position: relative;
  background: var(--primary-gradient);
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

.avatar-overlay {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

.user-basic-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  word-wrap: break-word;
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

.status-tag {
  border: none;
  font-weight: 500;
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

.skeleton-section-title {
  height: 24px;
  width: 160px;
  margin-bottom: 20px;
}

.skeleton-field {
  margin-bottom: 20px;
}

.skeleton-input {
  height: 40px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
  margin-top: 8px;
}

.skeleton-button {
  height: 44px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-primary {
  background: linear-gradient(90deg, rgba(102,126,234,0.2) 25%, rgba(102,126,234,0.3) 50%, rgba(102,126,234,0.2) 75%);
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
}

.skeleton-team-name {
  height: 20px;
  width: 120px;
  margin-bottom: 6px;
}

.skeleton-team-members {
  height: 16px;
  width: 80px;
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
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  margin-right: 6px;
  margin-bottom: 6px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.username-skeleton,
.stats-skeleton {
  margin-bottom: 20px;
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
.info-card,
.settings-card,
.preferences-card {
  border: none;
  border-radius: var(--border-radius-lg);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  margin-bottom: 24px;
  overflow: hidden;
}

.info-card:hover,
.settings-card:hover,
.preferences-card:hover {
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

.card-header h2,
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
.form-skeleton {
  padding: 24px;
}

.section-skeleton {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.fields-skeleton {
  padding-left: 0;
}

.actions-skeleton {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.team-skeleton {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.team-info-skeleton {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preferences-skeleton {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Центральная колонка */
.settings-card {
  grid-column: 1;
}

.profile-form {
  padding: 8px 24px 24px;
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
  margin-bottom: 8px;
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
  min-width: 180px;
}

.save-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.reset-button {
  border-radius: var(--border-radius);
  padding: 12px 24px;
  min-width: 120px;
}

/* Правая колонка */
.team-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
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

.team-info {
  flex: 1;
  min-width: 0;
}

.team-info h4 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-info p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

.team-arrow {
  margin-left: auto;
  color: var(--text-muted);
  flex-shrink: 0;
}

.preferences-content {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preference-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preference-item strong {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
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
  padding: 30px 20px;
  color: var(--text-muted);
}

.empty-state .el-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
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
  
  .user-stats {
    justify-content: center;
    gap: 20px;
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
  
  .card-header h2,
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
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-button,
  .reset-button {
    width: 100%;
    min-width: auto;
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
  
  .profile-form {
    padding: 8px 16px 16px;
  }
  
  .form-section {
    margin-bottom: 24px;
    padding-bottom: 20px;
  }
  
  .section-title {
    font-size: 1rem;
    margin-bottom: 16px;
  }
  
  :deep(.el-form-item__label) {
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
  
  .team-preview {
    padding: 12px;
  }
  
  .preference-item {
    gap: 6px;
  }
  
  .tags-container {
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .hero-content {
    padding: 0 12px;
  }

  .asterisk-left {
    display: flex;
    flex-direction: column;
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
  
  .card-header h2,
  .card-header h3 {
    font-size: 1rem;
  }
  
  .profile-form {
    padding: 0 12px 12px;
  }
  
  .form-actions {
    margin-top: 24px;
    padding-top: 20px;
  }
  
  .empty-state {
    padding: 20px 16px;
  }
  
  .empty-state .el-icon {
    font-size: 2rem;
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
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .skeleton-circle,
  .skeleton-line,
  .skeleton-input,
  .skeleton-button,
  .skeleton-tag {
    animation: none;
  }
  
  .info-card,
  .settings-card,
  .preferences-card,
  .team-preview,
  .save-button {
    transition: none;
  }
  
  .info-card:hover,
  .settings-card:hover,
  .preferences-card:hover,
  .team-preview:hover,
  .save-button:hover {
    transform: none;
  }
}

/* Исправление выхода за экран */
.profile-page,
.profile-hero,
.profile-content,
.hero-content {
  max-width: 100%;
  overflow-x: hidden;
}

.content-grid,
.user-main-card,
.user-stats {
  max-width: 100%;
}

/* Улучшение скролла */
@media (max-width: 768px) {
  .profile-page {
    -webkit-overflow-scrolling: touch;
  }
}
</style>