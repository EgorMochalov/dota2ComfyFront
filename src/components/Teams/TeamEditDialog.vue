<template>
  <el-dialog
    v-model="dialogVisible"
    title="Редактировать команду"
    width="600px"
    class="team-edit-dialog"
    @closed="handleClosed"
  >
    <el-form
      :model="form"
      :rules="rules"
      ref="formRef"
      label-width="140px"
      label-position="left"
    >
      <el-form-item label="Название" prop="name">
        <el-input
          v-model="form.name"
          placeholder="Введите название команды"
          size="large"
        />
      </el-form-item>

      <el-form-item label="Описание" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="Опишите вашу команду, цели и стиль игры"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>

      <el-form-item label="Регион" prop="region">
        <el-select
          v-model="form.region"
          placeholder="Выберите регион"
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

      <el-form-item label="Режимы игры" prop="game_modes">
        <el-select
          v-model="form.game_modes"
          multiple
          placeholder="Выберите режимы игры"
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

      <el-form-item label="Диапазон MMR">
        <div class="mmr-range">
          <el-input-number
            v-model="form.mmr_range_min"
            :min="0"
            :max="10000"
            placeholder="Min"
            controls-position="right"
          />
          <span class="range-separator">—</span>
          <el-input-number
            v-model="form.mmr_range_max"
            :min="0"
            :max="10000"
            placeholder="Max"
            controls-position="right"
          />
        </div>
      </el-form-item>

      <el-form-item label="Ищем роли" prop="required_roles">
        <el-select
          v-model="form.required_roles"
          multiple
          placeholder="Выберите роли"
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

      <el-form-item label="Теги" prop="tags">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="Добавьте теги"
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
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false" size="large">
        Отмена
      </el-button>
      <el-button
        type="primary"
        @click="handleSave"
        :loading="loading"
        size="large"
      >
        Сохранить изменения
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
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
        { required: true, message: 'Пожалуйста, введите название команды', trigger: 'blur' },
        { min: 3, message: 'Название команды должно быть не менее 3 символов', trigger: 'blur' },
        { max: 50, message: 'Название команды должно быть не более 50 символов', trigger: 'blur' }
      ],
      region: [
        { required: true, message: 'Пожалуйста, выберите регион', trigger: 'change' }
      ]
    }

    const dialogVisible = ref(props.modelValue)

    watch(() => props.modelValue, (value) => {
      dialogVisible.value = value
      if (value && props.team) {
        resetForm()
      }
    })

    watch(dialogVisible, (value) => {
      emit('update:modelValue', value)
    })

    const resetForm = () => {
      if (props.team) {
        form.value = {
          name: props.team.name,
          description: props.team.description || '',
          region: props.team.region,
          game_modes: props.team.game_modes || [],
          mmr_range_min: props.team.mmr_range_min,
          mmr_range_max: props.team.mmr_range_max,
          required_roles: props.team.required_roles || [],
          tags: props.team.tags || []
        }
      }
    }

    const handleSave = async () => {
      if (!formRef.value) return

      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true
      try {
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
      emit('closed')
    }

    return {
      REGIONS,
      GAME_MODES,
      ROLES,
      TAGS,
      formRef,
      loading,
      form,
      rules,
      dialogVisible,
      handleSave,
      handleClosed
    }
  }
}
</script>

<style scoped>
.team-edit-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.team-edit-dialog :deep(.el-form-item) {
  margin-bottom: 20px;
}

.team-edit-dialog :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
}

.mmr-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-separator {
  color: var(--text-muted);
  font-weight: 600;
}

.team-edit-dialog :deep(.el-input-number) {
  width: 120px;
}

.team-edit-dialog :deep(.el-select) {
  width: 100%;
}

@media (max-width: 640px) {
  .team-edit-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin: 20px auto;
  }

  .team-edit-dialog :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .mmr-range {
    flex-direction: column;
    gap: 8px;
  }

  .team-edit-dialog :deep(.el-input-number) {
    width: 100%;
  }
}
</style>