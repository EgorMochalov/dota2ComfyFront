<template>
  <el-dialog
    v-model="dialogVisible"
    :title="loading ? 'Сохранение...' : 'Редактировать команду'"
    :width="dialogWidth"
    class="team-edit-dialog"
    @closed="handleClosed"
    :close-on-click-modal="!loading"
    :close-on-press-escape="!loading"
  >
    <!-- Лоадер -->
    <div v-if="loadingData" class="dialog-loader">
      <div class="loader-content">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>Загрузка данных команды...</span>
      </div>
    </div>

    <!-- Основная форма -->
    <el-form
      v-else
      ref="formRef"
      :model="form"
      :rules="rules"
      :label-width="formLabelWidth"
      :label-position="formLabelPosition"
      class="edit-form"
    >
      <!-- Название команды -->
      <el-form-item label="Название команды" prop="name" class="form-item">
        <el-input
          v-model="form.name"
          placeholder="Введите название команды"
          size="large"
          :disabled="loading"
        />
      </el-form-item>

      <!-- Описание -->
      <el-form-item label="Описание" prop="description" class="form-item">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="Опишите вашу команду, цели и стиль игры"
          show-word-limit
          maxlength="500"
          :disabled="loading"
        />
      </el-form-item>

      <!-- Регион и режимы игры в одной строке на десктопе -->
      <div class="form-row">
        <el-form-item label="Регион" prop="region" class="form-item compact">
          <el-select
            v-model="form.region"
            placeholder="Выберите регион"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="region in REGIONS"
              :key="region.value"
              :label="region.label"
              :value="region.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Режимы игры" prop="game_modes" class="form-item compact">
          <el-select
            v-model="form.game_modes"
            multiple
            placeholder="Режимы"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="mode in GAME_MODES"
              :key="mode.value"
              :label="mode.label"
              :value="mode.value"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- Диапазон MMR -->
      <el-form-item label="Диапазон MMR" class="form-item">
        <div class="mmr-range">
          <div class="mmr-input-group">
            <el-input-number
              v-model="form.mmr_range_min"
              :min="0"
              :max="10000"
              placeholder="От"
              :disabled="loading"
              controls-position="right"
              class="mmr-input"
            />
            <span class="mmr-separator">—</span>
            <el-input-number
              v-model="form.mmr_range_max"
              :min="0"
              :max="10000"
              placeholder="До"
              :disabled="loading"
              controls-position="right"
              class="mmr-input"
            />
          </div>
          <div v-if="showMmrHint" class="mmr-hint">
            <el-icon><InfoFilled /></el-icon>
            <span>Диапазон: {{ form.mmr_range_min }} - {{ form.mmr_range_max }} MMR</span>
          </div>
        </div>
      </el-form-item>

      <!-- Роли и теги в одной строке на десктопе -->
      <div class="form-row">
        <el-form-item label="Ищем роли" prop="required_roles" class="form-item compact">
          <el-select
            v-model="form.required_roles"
            multiple
            placeholder="Роли"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="role in ROLES"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Теги" prop="tags" class="form-item compact">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Теги"
            :disabled="loading"
            class="full-width"
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

      <!-- Подсказка для тегов -->
      <div class="form-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>Начните вводить текст, чтобы добавить свой тег</span>
      </div>
    </el-form>

    <!-- Футер диалога -->
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          @click="dialogVisible = false" 
          :disabled="loading"
          size="large"
          class="cancel-btn"
        >
          Отмена
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSave"
          :loading="loading"
          size="large"
          class="save-btn"
        >
          <template #loading>
            <el-icon class="is-loading"><Loading /></el-icon>
            Сохранение...
          </template>
          <template v-if="!loading">
            Сохранить изменения
          </template>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch, computed, nextTick } from 'vue'
import { useTeamsStore } from '../../stores/teams'
import { REGIONS, GAME_MODES, ROLES, TAGS } from '../../utils/constants'
import { ElMessage } from 'element-plus'

export default {
  name: 'TeamEditDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    team: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue', 'saved', 'closed'],
  setup(props, { emit }) {
    const teamsStore = useTeamsStore()
    const formRef = ref()
    const loading = ref(false)
    const loadingData = ref(false)

    const form = ref({
      name: '',
      description: '',
      region: '',
      game_modes: [],
      mmr_range_min: null,
      mmr_range_max: null,
      required_roles: [],
      tags: []
    })

    const rules = {
      name: [
        { required: true, message: 'Введите название команды', trigger: 'blur' },
        { min: 3, message: 'Минимум 3 символа', trigger: 'blur' },
        { max: 50, message: 'Максимум 50 символов', trigger: 'blur' }
      ],
      region: [
        { required: true, message: 'Выберите регион', trigger: 'change' }
      ]
    }

    const dialogVisible = ref(props.modelValue)

    // Адаптивные вычисляемые свойства
    const dialogWidth = computed(() => {
      const width = window.innerWidth
      if (width < 580) return '95vw'
      if (width < 640) return '90vw'
      if (width < 768) return '85vw'
      if (width < 1024) return '80vw'
      return '600px'
    })

    const formLabelWidth = computed(() => {
      const width = window.innerWidth
      if (width < 480) return 'auto'
      if (width < 640) return '100px'
      return '120px'
    })

    const formLabelPosition = computed(() => {
      return window.innerWidth < 480 ? 'top' : 'left'
    })

    const showMmrHint = computed(() => {
      return form.value.mmr_range_min && form.value.mmr_range_max
    })

    watch(() => props.modelValue, async (value) => {
      dialogVisible.value = value
      if (value && props.team) {
        loadingData.value = true
        // Имитация загрузки для демонстрации
        await new Promise(resolve => setTimeout(resolve, 500))
        resetForm()
        loadingData.value = false
      }
    })

    watch(dialogVisible, (value) => {
      emit('update:modelValue', value)
    })

    const resetForm = () => {
      if (props.team) {
        form.value = {
          name: props.team.name || '',
          description: props.team.description || '',
          region: props.team.region || '',
          game_modes: props.team.game_modes || [],
          mmr_range_min: props.team.mmr_range_min || null,
          mmr_range_max: props.team.mmr_range_max || null,
          required_roles: props.team.required_roles || [],
          tags: props.team.tags || []
        }
      }
    }

    const handleSave = async () => {
      if (!formRef.value) return

      try {
        const valid = await formRef.value.validate()
        if (!valid) return

        loading.value = true
        await teamsStore.updateTeam(props.team.id, form.value)
        ElMessage.success('Команда успешно обновлена!')
        emit('saved')
        dialogVisible.value = false
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        loading.value = false
      }
    }

    const handleClosed = () => {
      formRef.value?.clearValidate()
      emit('closed')
    }

    return {
      REGIONS,
      GAME_MODES,
      ROLES,
      TAGS,
      formRef,
      loading,
      loadingData,
      form,
      rules,
      dialogVisible,
      dialogWidth,
      formLabelWidth,
      formLabelPosition,
      showMmrHint,
      handleSave,
      handleClosed
    }
  }
}
</script>

<style scoped>
.team-edit-dialog {
  --dialog-padding: 24px;
}

/* Лоадер */
.dialog-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
}

.loader-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.loader-content .el-icon {
  font-size: 1.2rem;
}

/* Основная форма */
.edit-form {
  padding: 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-item.compact {
  margin-bottom: 0;
}

/* Строки формы для десктопа */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

/* Диапазон MMR */
.mmr-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mmr-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mmr-input {
  flex: 1;
}

.mmr-separator {
  color: var(--text-muted);
  font-weight: 600;
  flex-shrink: 0;
}

.mmr-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.mmr-hint .el-icon {
  font-size: 0.9rem;
}

/* Подсказка формы */
.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: -8px;
  margin-bottom: 16px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.form-hint .el-icon {
  font-size: 0.9rem;
}

/* Футер диалога */
.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.save-btn {
  min-width: 120px;
}

/* Полноширинные элементы */
.full-width {
  width: 100%;
}

/* Адаптивность для планшетов */
@media (max-width: 1024px) {
  .team-edit-dialog {
    --dialog-padding: 20px;
  }
  
  .form-item {
    margin-bottom: 18px;
  }
}

@media (max-width: 768px) {
  .team-edit-dialog {
    --dialog-padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
    margin-bottom: 0;
  }

  .form-item.compact {
    margin-bottom: 18px;
  }

  .mmr-input-group {
    flex-direction: column;
    gap: 8px;
  }

  .mmr-separator {
    margin: 4px 0;
  }

  .dialog-loader {
    height: 180px;
  }
}

/* Адаптивность для мобильных */
@media (max-width: 640px) {
  .team-edit-dialog :deep(.el-dialog__header) {
    padding: 16px 16px 0;
  }

  .team-edit-dialog :deep(.el-dialog__body) {
    padding: 16px;
  }

  .team-edit-dialog :deep(.el-dialog__footer) {
    padding: 16px;
  }

  .form-item {
    margin-bottom: 16px;
  }

  .form-item.compact {
    margin-bottom: 16px;
  }

  .dialog-footer {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    margin: 0;
  }

  .dialog-loader {
    height: 160px;
  }

  .loader-content {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .team-edit-dialog :deep(.el-dialog__header) {
    padding: 12px 12px 0;
  }

  .team-edit-dialog :deep(.el-dialog__body) {
    padding: 12px;
  }

  .team-edit-dialog :deep(.el-dialog__footer) {
    padding: 12px;
  }

  .form-item {
    margin-bottom: 14px;
  }

  .dialog-loader {
    height: 140px;
  }

  .loader-content {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
}

@media (max-width: 360px) {
  .team-edit-dialog :deep(.el-dialog__body) {
    padding: 8px;
  }

  .form-item {
    margin-bottom: 12px;
  }

  .dialog-loader {
    height: 120px;
  }
}

/* Глобальные стили для Element Plus */
.team-edit-dialog :deep(.el-dialog) {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.team-edit-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: var(--dialog-padding);
  padding-bottom: 0;
  border: none;
}

.team-edit-dialog :deep(.el-dialog__body) {
  padding: var(--dialog-padding);
  padding-top: 16px;
}

.team-edit-dialog :deep(.el-dialog__footer) {
  padding: var(--dialog-padding);
  padding-top: 0;
  border: none;
}

.team-edit-dialog :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.team-edit-dialog :deep(.el-input__inner),
.team-edit-dialog :deep(.el-textarea__inner) {
  border-radius: var(--border-radius);
}

.team-edit-dialog :deep(.el-select) {
  width: 100%;
}

/* Состояния загрузки */
.team-edit-dialog :deep(.el-input.is-disabled .el-input__inner),
.team-edit-dialog :deep(.el-textarea.is-disabled .el-textarea__inner),
.team-edit-dialog :deep(.el-select.is-disabled .el-input__inner) {
  background-color: var(--bg-primary);
  color: var(--text-muted);
  cursor: not-allowed;
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .team-edit-dialog :deep(.el-dialog) {
    transition: none;
  }
}

/* Улучшение скролла на мобильных */
@media (max-width: 640px) {
  .team-edit-dialog :deep(.el-dialog) {
    -webkit-overflow-scrolling: touch;
  }
}

/* Предотвращение масштабирования в iOS */
@media (max-width: 480px) {
  .team-edit-dialog :deep(.el-input__inner) {
    font-size: 16px;
  }
}

/* Ландшафтный режим для мобильных */
@media (max-height: 500px) and (orientation: landscape) {
  .team-edit-dialog :deep(.el-dialog) {
    height: 90vh;
  }
  
  .team-edit-dialog :deep(.el-dialog__body) {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .dialog-loader {
    height: 120px;
  }
}
</style>