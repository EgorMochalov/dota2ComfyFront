<template>
  <div class="team-creation-form">
    <el-form
      :model="teamForm"
      :rules="teamRules"
      ref="teamFormRef"
      label-position="top"
      @submit.prevent="handleCreateTeam"
      class="enhanced-form"
    >
      <!-- Основная информация -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <el-icon><User /></el-icon>
            <span>Основная информация</span>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-form-item label="Название команды" prop="name" class="enhanced-form-item">
              <el-input
                v-model="teamForm.name"
                placeholder="Введите уникальное название команды"
                size="large"
                :prefix-icon="Star"
                maxlength="30"
                show-word-limit
              />
              <div class="form-hint">От 3 до 30 символов. Будет видно другим игрокам.</div>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item label="Регион" prop="region" class="enhanced-form-item">
              <el-select
                v-model="teamForm.region"
                placeholder="Выберите основной регион"
                size="large"
                style="width: 100%"
                :prefix-icon="Location"
              >
                <el-option
                  v-for="region in REGIONS"
                  :key="region.value"
                  :label="region.label"
                  :value="region.value"
                >
                  <div class="region-option">
                    <span class="region-name">{{ region.label }}</span>
                    <el-tag size="small" effect="plain">{{ region.value.toUpperCase() }}</el-tag>
                  </div>
                </el-option>
              </el-select>
              <div class="form-hint">Выберите регион для поиска тиммейтов с хорошим пингом</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Описание команды" prop="description" class="enhanced-form-item">
          <el-input
            v-model="teamForm.description"
            type="textarea"
            :rows="4"
            placeholder="Опишите вашу команду, цели, стиль игры и ожидания от участников..."
            maxlength="500"
            show-word-limit
            resize="none"
          />
          <div class="form-hint">
            Расскажите о команде: цели (развлечение, турниры, профессиональная игра), 
            расписание, требования к участникам. Это поможет привлечь подходящих игроков.
          </div>
        </el-form-item>
      </el-card>

      <!-- Игровые настройки -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <el-icon><Trophy /></el-icon>
            <span>Игровые настройки</span>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :md="12">
            <el-form-item label="Диапазон MMR" class="enhanced-form-item">
              <div class="mmr-range">
                <div class="mmr-inputs">
                  <div class="mmr-input-group">
                    <label>От</label>
                    <el-input-number
                      v-model="teamForm.mmr_range_min"
                      :min="0"
                      :max="10000"
                      :step="100"
                      placeholder="Min MMR"
                      size="large"
                      controls-position="right"
                    />
                  </div>
                  <div class="mmr-separator">—</div>
                  <div class="mmr-input-group">
                    <label>До</label>
                    <el-input-number
                      v-model="teamForm.mmr_range_max"
                      :min="0"
                      :max="10000"
                      :step="100"
                      placeholder="Max MMR"
                      size="large"
                      controls-position="right"
                    />
                  </div>
                </div>
                <div class="mmr-preview" v-if="showMmrPreview">
                  <span class="mmr-value">{{ teamForm.mmr_range_min || 0 }} - {{ teamForm.mmr_range_max || 0 }}</span>
                  <span class="mmr-label">MMR</span>
                </div>
              </div>
              <div class="form-hint">
                Укажите желаемый диапазон MMR для участников команды. 
                Это поможет найти игроков подходящего уровня.
              </div>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="12">
            <el-form-item label="Режимы игры" prop="game_modes" class="enhanced-form-item">
              <el-select
                v-model="teamForm.game_modes"
                multiple
                placeholder="Выберите предпочитаемые режимы"
                size="large"
                style="width: 100%"
              >
                <el-option-group
                  v-for="group in gameModeGroups"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="mode in group.options"
                    :key="mode.value"
                    :label="mode.label"
                    :value="mode.value"
                  >
                    <div class="game-mode-option">
                      <el-icon><VideoPlay /></el-icon>
                      <span>{{ mode.label }}</span>
                    </div>
                  </el-option>
                </el-option-group>
              </el-select>
              <div class="form-hint">
                Выберите режимы, в которые вы планируете играть чаще всего
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- Состав и роли -->
      <el-card class="form-section">
        <template #header>
          <div class="section-header">
            <el-icon><UserFilled /></el-icon>
            <span>Состав и роли</span>
          </div>
        </template>

        <el-form-item label="Ищем игроков на роли" prop="required_roles" class="enhanced-form-item">
          <div class="roles-selection">
            <div 
              v-for="role in ROLES" 
              :key="role.value"
              class="role-card"
              :class="{ selected: teamForm.required_roles.includes(role.value) }"
              @click="toggleRole(role.value)"
            >
              <div class="role-icon" :class="role.value">
                <el-icon><Avatar /></el-icon>
              </div>
              <div class="role-info">
                <span class="role-name">{{ role.label }}</span>
                <span class="role-desc">{{ getRoleDescription(role.value) }}</span>
              </div>
              <el-icon v-if="teamForm.required_roles.includes(role.value)" class="check-icon">
                <CircleCheck />
              </el-icon>
            </div>
          </div>
          <div class="form-hint">
            Выберите роли, на которые вы ищете игроков. Можно выбрать несколько ролей.
          </div>
        </el-form-item>

        <el-form-item label="Теги команды" prop="tags" class="enhanced-form-item">
          <el-select
            v-model="teamForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Добавьте теги для описания команды"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="tag in popularTags"
              :key="tag"
              :label="tag"
              :value="tag"
            >
              <div class="tag-option">
                <el-tag size="small" effect="plain">{{ tag }}</el-tag>
              </div>
            </el-option>
          </el-select>
          <div class="tags-preview" v-if="teamForm.tags.length > 0">
            <el-tag
              v-for="tag in teamForm.tags"
              :key="tag"
              closable
              @close="removeTag(tag)"
              class="preview-tag"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div class="form-hint">
            Добавьте теги, которые описывают вашу команду (например: competitive, casual, english, tournaments)
          </div>
        </el-form-item>
      </el-card>

      <!-- Действия -->
      <div class="form-actions">
        <el-button 
          size="large" 
          @click="resetForm"
          class="reset-btn"
        >
          <el-icon><Refresh /></el-icon>
          Сбросить
        </el-button>
        <el-button 
          type="primary" 
          size="large" 
          @click="handleCreateTeam" 
          :loading="creating"
          class="submit-btn"
        >
          <el-icon v-if="!creating"><CircleCheck /></el-icon>
          {{ creating ? 'Создание команды...' : 'Создать команду' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useTeamsStore } from '../../stores/teams'
import { REGIONS, GAME_MODES, ROLES, TAGS } from '../../utils/constants'
import { ElMessage } from 'element-plus'
import {
  Star,
  User,
  Location,
  Trophy,
  UserFilled,
  VideoPlay,
  Avatar,
  CircleCheck,
  Refresh,
  View
} from '@element-plus/icons-vue'

export default {
  name: 'TeamCreationForm',
  emits: ['team-created'],
  setup(props, { emit }) {
    const teamsStore = useTeamsStore()

    const teamFormRef = ref()
    const creating = ref(false)

    const teamForm = ref({
      name: '',
      description: '',
      region: '',
      game_modes: [],
      mmr_range_min: null,
      mmr_range_max: null,
      required_roles: [],
      tags: []
    })

    const teamRules = {
      name: [
        { required: true, message: 'Пожалуйста, введите название команды', trigger: 'blur' },
        { min: 3, message: 'Название команды должно быть не менее 3 символов', trigger: 'blur' },
        { max: 30, message: 'Название команды должно быть не более 30 символов', trigger: 'blur' }
      ],
      region: [
        { required: true, message: 'Пожалуйста, выберите регион', trigger: 'change' }
      ],
      required_roles: [
        { 
          type: 'array', 
          required: true, 
          message: 'Пожалуйста, выберите хотя бы одну роль', 
          trigger: 'change' 
        }
      ]
    }

    // Группируем режимы игры для лучшей организации
    const gameModeGroups = computed(() => [
      {
        label: 'Основные режимы',
        options: GAME_MODES.filter(mode => 
          ['all_pick', 'ranked', 'turbo', 'captains_mode'].includes(mode.value)
        )
      },
      {
        label: 'Дополнительные режимы',
        options: GAME_MODES.filter(mode => 
          !['all_pick', 'ranked', 'turbo', 'captains_mode'].includes(mode.value)
        )
      }
    ])

    // Популярные теги для быстрого выбора
    const popularTags = computed(() => [
      'competitive',
      'casual',
      'english',
      'russian',
      'tournaments',
      'practice',
      'coaching',
      'learning',
      'pro',
      'semi-pro',
      'friendly',
      'serious',
      'active',
      'weekend',
      'evening'
    ])

    const showPreview = computed(() => {
      return teamForm.value.name || teamForm.value.description || teamForm.value.region
    })

    const showMmrPreview = computed(() => {
      return teamForm.value.mmr_range_min !== null || teamForm.value.mmr_range_max !== null
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const getRoleDescription = (role) => {
      const descriptions = {
        'carry': 'Основной дамагер, фармит и несет игру',
        'mid': 'Центральная линия, контролирует темп игры',
        'offlane': 'Сложная линия, инициирует и контролирует',
        'support': 'Помощник, варды, саппорт предметы',
        'hard_support': 'Полный саппорт, минимальный фарм'
      }
      return descriptions[role] || 'Роль в команде'
    }

    const toggleRole = (role) => {
      const index = teamForm.value.required_roles.indexOf(role)
      if (index > -1) {
        teamForm.value.required_roles.splice(index, 1)
      } else {
        teamForm.value.required_roles.push(role)
      }
    }

    const removeTag = (tag) => {
      const index = teamForm.value.tags.indexOf(tag)
      if (index > -1) {
        teamForm.value.tags.splice(index, 1)
      }
    }

    const handleCreateTeam = async () => {
      if (!teamFormRef.value) return

      const valid = await teamFormRef.value.validate()
      if (!valid) return

      // Проверяем, что MMR диапазон корректен
      if (teamForm.value.mmr_range_min !== null && 
          teamForm.value.mmr_range_max !== null &&
          teamForm.value.mmr_range_min > teamForm.value.mmr_range_max) {
        ElMessage.error('Минимальный MMR не может быть больше максимального')
        return
      }

      creating.value = true
      try {
        await teamsStore.createTeam(teamForm.value)
        emit('team-created')
        resetForm()
        ElMessage.success({
          message: 'Команда успешно создана! Теперь вы можете управлять ею и приглашать игроков.',
          duration: 5000
        })
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        creating.value = false
      }
    }

    const resetForm = () => {
      teamForm.value = {
        name: '',
        description: '',
        region: '',
        game_modes: [],
        mmr_range_min: null,
        mmr_range_max: null,
        required_roles: [],
        tags: []
      }
    }

    return {
      REGIONS,
      ROLES,
      teamFormRef,
      creating,
      teamForm,
      teamRules,
      gameModeGroups,
      popularTags,
      showPreview,
      showMmrPreview,
      getRegionLabel,
      getRoleDescription,
      toggleRole,
      removeTag,
      handleCreateTeam,
      resetForm,
      Star,
      User,
      Location,
      Trophy,
      UserFilled,
      VideoPlay,
      Avatar,
      CircleCheck,
      Refresh,
      View
    }
  }
}
</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  color: white;
}

.header-icon {
  margin-bottom: 15px;
}

.form-header h2 {
  margin: 0 0 10px 0;
  font-size: 2rem;
  font-weight: 700;
}

.form-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.form-section {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.section-header .el-icon {
  color: #3498db;
}

.enhanced-form-item {
  margin-bottom: 24px;
}

.enhanced-form-item :deep(.el-form-item__label) {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 1rem;
}

.form-hint {
  margin-top: 8px;
  font-size: 0.85rem;
  color: #7f8c8d;
  line-height: 1.4;
}

.region-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.region-name {
  font-weight: 500;
}

.mmr-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mmr-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mmr-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.mmr-input-group label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.mmr-separator {
  color: #bdc3c7;
  font-weight: bold;
  padding: 0 8px;
}

.mmr-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.mmr-value {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.mmr-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.game-mode-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.roles-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e4e7ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.role-card:hover {
  border-color: #3498db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.15);
}

.role-card.selected {
  border-color: #3498db;
  background: linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%);
}

.role-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: white;
  font-size: 20px;
}

.role-icon.carry { background: #e74c3c; }
.role-icon.mid { background: #3498db; }
.role-icon.offlane { background: #f39c12; }
.role-icon.support { background: #27ae60; }
.role-icon.hard_support { background: #9b59b6; }

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-name {
  font-weight: 600;
  color: #2c3e50;
}

.role-desc {
  font-size: 0.8rem;
  color: #7f8c8d;
  line-height: 1.2;
}

.check-icon {
  color: #27ae60;
  font-size: 20px;
}

.tags-preview {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  transition: all 0.3s ease;
}

.preview-tag:hover {
  transform: scale(1.05);
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.reset-btn {
  width: 160px;
  border: 1px solid #dcdfe6;
}

.submit-btn {
  width: 200px;
  font-weight: 600;
}

.preview-section {
  margin-top: 32px;
  border-radius: 12px;
}

.team-preview {
  padding: 20px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.default-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.preview-info h3 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.4rem;
}

.preview-region {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-description {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.6;
  font-style: italic;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
}

.preview-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .form-header {
    padding: 20px;
    margin-bottom: 24px;
  }
  
  .form-header h2 {
    font-size: 1.6rem;
  }
  
  .roles-selection {
    grid-template-columns: 1fr;
  }
  
  .mmr-inputs {
    flex-direction: column;
    gap: 16px;
  }
  
  .mmr-separator {
    padding: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .reset-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .preview-header {
    flex-direction: column;
    text-align: center;
  }
  
  .preview-stats {
    grid-template-columns: 1fr;
  }
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Кастомные стили для Element Plus */
:deep(.el-card__header) {
  border-bottom: 1px solid #e4e7ed;
  padding: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea .el-textarea__inner) {
  border-radius: 8px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 6px;
}
</style>