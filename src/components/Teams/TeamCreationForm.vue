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
        </el-form-item>
        <div class="form-hint mb-3">
          Выберите роли, на которые вы ищете игроков. Можно выбрать несколько ролей.
        </div>

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

    const showMmrPreview = computed(() => {
      return teamForm.value.mmr_range_min !== null || teamForm.value.mmr_range_max !== null
    })

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
      showMmrPreview,
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
.form-section {
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  background: var(--bg-card);
}

.form-section:hover {
  box-shadow: var(--shadow-lg);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.section-header .el-icon {
  color: var(--primary-color);
}

.enhanced-form-item {
  margin-bottom: 24px;
}

.enhanced-form-item :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 1rem;
}

.form-hint {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
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
  color: var(--text-primary);
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
  color: var(--text-muted);
  font-weight: 500;
}

.mmr-separator {
  color: var(--text-muted);
  font-weight: bold;
  padding: 0 8px;
}

.mmr-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.mmr-value {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.mmr-label {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.game-mode-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: var(--text-primary);
}

.roles-selection {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background: var(--bg-secondary);
}

.role-card:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.role-card.selected {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
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
  flex-shrink: 0;
}

.role-icon.carry { background: var(--danger-gradient); }
.role-icon.mid { background: var(--primary-gradient); }
.role-icon.offlane { background: var(--warning-gradient); }
.role-icon.support { background: var(--success-gradient); }
.role-icon.hard_support { background: var(--secondary-gradient); }

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.role-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.role-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.2;
}

.check-icon {
  color: var(--success-color);
  font-size: 20px;
  flex-shrink: 0;
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
  background: var(--bg-secondary);
  border-radius: 12px;
}

.reset-btn {
  width: 160px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.submit-btn {
  width: 200px;
  font-weight: 600;
  background: var(--primary-gradient);
  border: none;
}

/* Адаптивность для формы создания команды */
@media (max-width: 768px) {
  .form-section {
    margin-bottom: 20px;
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
    padding: 20px;
  }
  
  .reset-btn,
  .submit-btn {
    width: 100%;
  }
  
  .role-card {
    padding: 12px;
  }
  
  .role-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  
  .role-name {
    font-size: 0.85rem;
  }
  
  .role-desc {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .form-section {
    margin-bottom: 16px;
  }
  
  .section-header {
    font-size: 1rem;
  }
  
  .enhanced-form-item {
    margin-bottom: 20px;
  }
  
  .form-actions {
    margin-top: 24px;
    padding: 16px;
  }
}

@media (max-width: 360px) {
  .role-card {
    padding: 10px;
    gap: 8px;
  }
  
  .role-info {
    gap: 2px;
  }
  
  .role-name {
    font-size: 0.8rem;
  }
  
  .role-desc {
    font-size: 0.65rem;
  }
}

/* Кастомные стили для Element Plus */
:deep(.el-card__header) {
  border-bottom: 1px solid var(--border-color);
  padding: 20px;
  background: var(--bg-secondary);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea .el-textarea__inner) {
  border-radius: 8px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 6px;
}

:deep(.el-form-item__label) {
  color: var(--text-primary) !important;
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .form-section,
  .role-card,
  .preview-tag {
    transition: none;
  }
  
  .role-card:hover {
    transform: none;
  }
}
</style>