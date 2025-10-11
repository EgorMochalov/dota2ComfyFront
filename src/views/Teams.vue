<template>
  <div class="teams-page">
    <!-- Заголовок с градиентом -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Поиск команд</h1>
        <p class="page-subtitle">Найдите идеальную команду для игры в Dota 2</p>
      </div>
      <div class="header-stats">
        <!-- <div class="stat-item">
          <div class="stat-value">{{ totalTeams }}</div>
          <div class="stat-label">команд в активном поиске</div>
        </div> -->
      </div>
    </div>

    <!-- Основной контент -->
    <div class="teams-content">
      <!-- Табы -->
      <el-tabs v-model="activeTab" class="page-tabs">
        <el-tab-pane label="Поиск команд" name="teams">
          <div class="filters-and-results">
            <!-- Боковая панель с фильтрами -->
            <div class="filters-sidebar">
              <!-- Кнопка для мобильных - показать/скрыть фильтры -->
              <div class="mobile-filters-toggle" @click="showMobileFilters = !showMobileFilters">
                <div class="toggle-content">
                  <el-icon class="toggle-icon"><Filter /></el-icon>
                  <div class="toggle-text">
                    <span class="toggle-title">Фильтры</span>
                    <span class="filters-count" v-if="activeTeamsFiltersCount > 0">
                      {{ activeTeamsFiltersCount }} активных
                    </span>
                  </div>
                </div>
                <el-icon :class="{ 'rotate-180': showMobileFilters }"><ArrowDown /></el-icon>
              </div>

              <div class="filters-container" :class="{ 'mobile-visible': showMobileFilters }">
                <div class="filters-card">
                  <div class="filters-header">
                    <h3>Фильтры</h3>
                    <el-button 
                      type="text" 
                      @click="resetTeamsFilters" 
                      class="reset-btn"
                    >
                      Сбросить все
                    </el-button>
                  </div>

                  <div class="filters-body">
                    <!-- Регион -->
                    <div class="filter-group">
                      <label class="filter-label">Регион</label>
                      <el-select
                        v-model="filtersTeams.region"
                        placeholder="Все регионы"
                        clearable
                        class="filter-select"
                      >
                        <el-option
                          v-for="region in REGIONS"
                          :key="region.value"
                          :label="region.label"
                          :value="region.value"
                        />
                      </el-select>
                    </div>

                    <!-- MMR диапазон -->
                    <div class="filter-group">
                      <label class="filter-label">MMR диапазон</label>
                      <div class="range-inputs">
                        <el-input-number
                          v-model="filtersTeams.mmr_min"
                          :min="0"
                          :max="10000"
                          placeholder="От"
                          controls-position="right"
                          class="range-input"
                        />
                        <span class="range-separator">—</span>
                        <el-input-number
                          v-model="filtersTeams.mmr_max"
                          :min="0"
                          :max="10000"
                          placeholder="До"
                          controls-position="right"
                          class="range-input"
                        />
                      </div>
                    </div>

                    <!-- Режимы игры -->
                    <div class="filter-group">
                      <label class="filter-label">Режимы игры</label>
                      <el-select
                        v-model="filtersTeams.game_modes"
                        multiple
                        placeholder="Все режимы"
                        clearable
                        class="filter-select"
                      >
                        <el-option
                          v-for="mode in GAME_MODES"
                          :key="mode.value"
                          :label="mode.label"
                          :value="mode.value"
                        />
                      </el-select>
                    </div>

                    <!-- Ищут роли -->
                    <div class="filter-group">
                      <label class="filter-label">Ищут игроков на роли</label>
                      <div class="roles-grid">
                        <div
                          v-for="role in ROLES"
                          :key="role.value"
                          class="role-option"
                          :class="{ active: filtersTeams.required_roles.includes(role.value) }"
                          @click="toggleTeamsRole(role.value)"
                        >
                          <div class="role-icon" :class="`role-${role.value}`">
                            <el-icon><User /></el-icon>
                          </div>
                          <span class="role-label">{{ role.label }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Теги -->
                    <div class="filter-group">
                      <label class="filter-label">Теги</label>
                      <el-select
                        v-model="filtersTeams.tags"
                        multiple
                        filterable
                        allow-create
                        default-first-option
                        placeholder="Выберите теги"
                        class="filter-select"
                      >
                        <el-option
                          v-for="tag in TAGS"
                          :key="tag"
                          :label="tag"
                          :value="tag"
                        />
                      </el-select>
                    </div>

                    <!-- Дополнительные фильтры -->
                    <div class="filter-group">
                      <label class="filter-label">Дополнительно</label>
                      <div class="switch-filters">
                        <div class="switch-item">
                          <el-switch
                            v-model="filtersTeams.is_searching"
                            active-color="var(--primary-color)"
                          />
                          <span class="switch-label">Только в поиске</span>
                        </div>
                        <div class="switch-item">
                          <el-switch
                            v-model="filtersTeams.looking_for_scrim"
                            active-color="var(--warning-color)"
                          />
                          <span class="switch-label">Ищут команды для кв</span>
                        </div>
                      </div>
                    </div>

                    <!-- Кнопка поиска -->
                    <el-button
                      type="primary"
                      class="search-btn"
                      @click="handleTeamsSearch"
                      :loading="searchingTeams"
                      :disabled="!hasActiveTeamsFilters"
                    >
                      <template #icon>
                        <el-icon><Search /></el-icon>
                      </template>
                      Применить фильтры
                    </el-button>
                  </div>
                </div>

                <!-- Быстрый поиск -->
                <div class="quick-search-card">
                  <h4>Быстрый поиск</h4>
                  <div class="quick-search-buttons">
                    <el-button
                      v-for="preset in teamsSearchPresets"
                      :key="preset.name"
                      type="text"
                      class="quick-search-btn"
                      @click="applyTeamsPreset(preset)"
                    >
                      {{ preset.name }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Основная область с результатами -->
            <div class="results-area">
              <!-- Панель управления результатами -->
              <div class="results-header">
                <div class="results-info">
                  <h3>Найдено команд: {{ teamsResults.length }}</h3>
                  <div class="active-filters" v-if="activeTeamsFiltersCount > 0">
                    <el-tag
                      v-for="filter in activeTeamsFiltersList"
                      :key="filter.key"
                      closable
                      @close="removeTeamsFilter(filter.key)"
                      class="active-filter-tag"
                    >
                      {{ filter.label }}
                    </el-tag>
                  </div>
                </div>
                <div class="results-controls">
                  <el-select
                    v-model="sortByTeams"
                    placeholder="Сортировка"
                    @change="handleTeamsSort"
                    class="sort-select"
                  >
                    <el-option label="По MMR (убывание)" value="mmr_desc" />
                    <el-option label="По MMR (возрастание)" value="mmr_asc" />
                    <el-option label="По названию (А-Я)" value="name_asc" />
                    <el-option label="По названию (Я-А)" value="name_desc" />
                    <el-option label="По размеру команды" value="size" />
                  </el-select>
                </div>
              </div>

              <!-- Лоадер при загрузке -->
              <div v-if="searchingTeams" class="loading-container">
                <div class="loader-content">
                  <el-icon class="loading-spinner" :size="48"><Loading /></el-icon>
                  <p>Поиск команд...</p>
                </div>
              </div>

              <!-- Сетка команд -->
              <div v-else-if="teamsResults.length > 0" class="teams-grid">
                <div
                  v-for="team in teamsResults"
                  :key="team.id"
                  class="team-card"
                  :class="{ 'scrim-team': team.looking_for_scrim }"
                >
                  <!-- Заголовок карточки -->
                  <div class="team-header">
                    <div class="team-avatar">
                      <el-avatar :size="64" :src="team.avatar_url ? team.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" />
                      <div class="team-badges">
                        <el-tag 
                          v-if="team.looking_for_scrim" 
                          type="warning" 
                          size="small"
                          class="scrim-badge"
                        >
                          КВ
                        </el-tag>
                      </div>
                    </div>
                    <div class="team-main-info">
                      <h4 
                        @click="$router.push(`/teams/${team.id}`)" 
                        class="team-name"
                      >
                        {{ team.name }}
                      </h4>
                      <div class="team-meta">
                        <span class="team-mmr">
                          <el-icon><TrendCharts /></el-icon>
                          {{ team.mmr_range_min }} - {{ team.mmr_range_max }} MMR
                        </span>
                        <span class="team-region">
                          <el-icon><Location /></el-icon>
                          {{ getRegionLabel(team.region) }}
                        </span>
                        <span class="team-size">
                          <el-icon><User /></el-icon>
                          {{ team.members?.length || 0 }}/5
                        </span>
                      </div>
                    </div>
                    <div class="team-status">
                      <el-tag 
                        :type="team.is_searching ? 'success' : 'info'" 
                        class="status-tag"
                      >
                        {{ team.is_searching ? 'В поиске' : 'Не активна' }}
                      </el-tag>
                    </div>
                  </div>

                  <!-- Описание команды -->
                  <div class="team-description" v-if="team.description">
                    <p>{{ truncateText(team.description, 120) }}</p>
                  </div>

                  <!-- Ищут роли -->
                  <div class="team-roles" v-if="team.required_roles && team.required_roles.length">
                    <div class="roles-label">Ищут роли:</div>
                    <div class="roles-list">
                      <div
                        v-for="role in team.required_roles"
                        :key="role"
                        class="role-badge"
                        :class="`role-${role}`"
                      >
                        {{ getRoleLabel(role) }}
                      </div>
                    </div>
                  </div>

                  <!-- Режимы игры -->
                  <div class="team-modes" v-if="team.game_modes && team.game_modes.length">
                    <div class="modes-label">Режимы:</div>
                    <div class="modes-list">
                      <el-tag
                        v-for="mode in team.game_modes.slice(0, 3)"
                        :key="mode"
                        size="small"
                        class="mode-tag"
                      >
                        {{ getGameModeLabel(mode) }}
                      </el-tag>
                      <el-tag 
                        v-if="team.game_modes.length > 3" 
                        size="small" 
                        type="info"
                      >
                        +{{ team.game_modes.length - 3 }}
                      </el-tag>
                    </div>
                  </div>

                  <!-- Теги -->
                  <div class="team-tags" v-if="team.tags && team.tags.length">
                    <div class="tags-list">
                      <el-tag
                        v-for="tag in team.tags.slice(0, 4)"
                        :key="tag"
                        size="small"
                        type="warning"
                        class="team-tag"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </div>

                  <!-- Действия -->
                  <div class="team-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="$router.push(`/teams/${team.id}`)"
                      class="action-btn"
                    >
                      <el-icon><View /></el-icon>
                      Подробнее
                    </el-button>
                    <el-button
                      type="success"
                      size="small"
                      @click="applyToTeam(team)"
                      :disabled="authStore.user?.team_id || !team.is_searching"
                      class="action-btn"
                    >
                      <el-icon><Plus /></el-icon>
                      Подать заявку
                    </el-button>
                    <el-button
                      v-if="authStore.user?.team_id && team.looking_for_scrim"
                      type="warning"
                      size="small"
                      @click="contactForScrim(team)"
                      :disabled="authStore.user?.team_id === team.id"
                      class="action-btn"
                    >
                      <el-icon><ChatDotRound /></el-icon>
                      Предложить кв
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- Состояние пустых результатов -->
              <div v-else-if="teamsSearched && teamsResults.length === 0" class="empty-results">
                <div class="empty-state">
                  <el-icon class="empty-icon"><Search /></el-icon>
                  <h4>Команды не найдены</h4>
                  <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
                  <el-button type="primary" @click="resetTeamsFilters">
                    Сбросить фильтры
                  </el-button>
                </div>
              </div>

              <!-- Начальное состояние (до поиска) -->
              <div v-else class="initial-state">
                <div class="initial-content">
                  <el-icon class="initial-icon"><User /></el-icon>
                  <h4>Начните поиск команд</h4>
                  <p>Используйте фильтры, чтобы найти подходящие команды</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Вкладка создания команды -->
        <el-tab-pane label="Создать команду" name="create" v-if="!authStore.user?.team_id">
          <div class="creation-container">
            <TeamCreationForm @team-created="handleTeamCreated" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Диалог подачи заявки -->
    <el-dialog
      v-model="applyDialogVisible"
      title="Подать заявку в команду"
      width="500px"
      class="invite-dialog"
    >
      <el-form :model="applicationForm">
        <el-form-item label="Сообщение">
          <el-input
            v-model="applicationForm.message"
            type="textarea"
            :rows="4"
            placeholder="Расскажите о себе и почему хотите присоединиться к команде..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="applyDialogVisible = false">Отмена</el-button>
        <el-button 
          type="primary" 
          @click="submitApplication" 
          :loading="applying"
        >
          Отправить заявку
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTeamsStore } from '../stores/teams'
import { useApplicationsStore } from '../stores/applications'
import { useChatStore } from '../stores/chat'
import TeamCreationForm from '../components/Teams/TeamCreationForm.vue'
import { REGIONS, GAME_MODES, ROLES, TAGS } from '../utils/constants'
import { ElMessage } from 'element-plus'
import {
  Search,
  User,
  ChatDotRound,
  View,
  Plus,
  TrendCharts,
  Location,
  Filter,
  ArrowDown,
  Loading
} from '@element-plus/icons-vue'

export default {
  name: 'Teams',
  components: {
    TeamCreationForm,
    Search,
    User,
    ChatDotRound,
    View,
    Plus,
    TrendCharts,
    Location,
    Filter,
    ArrowDown,
    Loading
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const teamsStore = useTeamsStore()
    const applicationsStore = useApplicationsStore()
    const chatStore = useChatStore()

    const activeTab = ref(route.query.create ? 'create' : 'teams')
    const showMobileFilters = ref(false)

    // Фильтры для поиска команд
    const filtersTeams = ref({
      region: '',
      game_modes: [],
      required_roles: [],
      mmr_min: null,
      mmr_max: null,
      tags: [],
      is_searching: true,
      looking_for_scrim: false
    })

    const teamsResults = ref([])
    const searchingTeams = ref(false)
    const teamsSearched = ref(false)
    const sortByTeams = ref('mmr_desc')
    const applyDialogVisible = ref(false)
    const applying = ref(false)
    const selectedTeam = ref(null)

    const applicationForm = ref({
      message: ''
    })

    // Пресеты для быстрого поиска команд
    const teamsSearchPresets = ref([
      {
        name: 'Высокий MMR',
        filters: { mmr_min: 5000, is_searching: true }
      },
      {
        name: 'Ищут поддержек',
        filters: { required_roles: ['support', 'hard_support'], is_searching: true }
      },
      {
        name: 'Ищут керри/мид',
        filters: { required_roles: ['carry', 'mid'], is_searching: true }
      },
      {
        name: 'Турнирные',
        filters: { tags: ['tournaments', 'competitive'], is_searching: true }
      }
    ])

    const hasActiveTeamsFilters = computed(() => {
      return Object.values(filtersTeams.value).some(value => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'number') return value !== null
        return !!value
      })
    })

    const activeTeamsFiltersCount = computed(() => {
      let count = 0
      Object.entries(filtersTeams.value).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          count += value.length
        } else if (value !== null && value !== '' && value !== false) {
          count++
        }
      })
      return count
    })

    const activeTeamsFiltersList = computed(() => {
      const active = []
      
      if (filtersTeams.value.region) {
        active.push({
          key: 'region',
          label: `Регион: ${getRegionLabel(filtersTeams.value.region)}`
        })
      }

      if (filtersTeams.value.mmr_min || filtersTeams.value.mmr_max) {
        const min = filtersTeams.value.mmr_min || '0'
        const max = filtersTeams.value.mmr_max || '∞'
        active.push({
          key: 'mmr',
          label: `MMR: ${min}-${max}`
        })
      }

      if (filtersTeams.value.game_modes.length > 0) {
        active.push({
          key: 'game_modes',
          label: `Режимы: ${filtersTeams.value.game_modes.length}`
        })
      }

      if (filtersTeams.value.required_roles.length > 0) {
        active.push({
          key: 'required_roles',
          label: `Роли: ${filtersTeams.value.required_roles.length}`
        })
      }

      if (filtersTeams.value.tags.length > 0) {
        active.push({
          key: 'tags',
          label: `Теги: ${filtersTeams.value.tags.length}`
        })
      }

      if (filtersTeams.value.is_searching) {
        active.push({ key: 'is_searching', label: 'В поиске' })
      }

      if (filtersTeams.value.looking_for_scrim) {
        active.push({ key: 'looking_for_scrim', label: 'Ищут кв' })
      }

      return active
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

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const toggleTeamsRole = (role) => {
      const index = filtersTeams.value.required_roles.indexOf(role)
      if (index > -1) {
        filtersTeams.value.required_roles.splice(index, 1)
      } else {
        filtersTeams.value.required_roles.push(role)
      }
    }

    const removeTeamsFilter = (filterKey) => {
      switch (filterKey) {
        case 'region':
          filtersTeams.value.region = ''
          break
        case 'mmr':
          filtersTeams.value.mmr_min = null
          filtersTeams.value.mmr_max = null
          break
        case 'game_modes':
          filtersTeams.value.game_modes = []
          break
        case 'required_roles':
          filtersTeams.value.required_roles = []
          break
        case 'tags':
          filtersTeams.value.tags = []
          break
        case 'is_searching':
          filtersTeams.value.is_searching = true
          break
        case 'looking_for_scrim':
          filtersTeams.value.looking_for_scrim = false
          break
      }
      handleTeamsSearch()
    }

    const applyTeamsPreset = (preset) => {
      filtersTeams.value = { ...filtersTeams.value, ...preset.filters }
      handleTeamsSearch()
    }

    const handleTeamsSearch = async () => {
      searchingTeams.value = true
      teamsSearched.value = true
      showMobileFilters.value = false
      
      try {
        // Очищаем пустые параметры
        const params = {}
        Object.keys(filtersTeams.value).forEach(key => {
          const value = filtersTeams.value[key]
          if (value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            params[key] = value
          }
        })

        await teamsStore.searchTeams(params)
        teamsResults.value = teamsStore.searchResults
      } catch (error) {
        console.error('Search teams error:', error)
        ElMessage.error('Ошибка поиска команд')
      } finally {
        searchingTeams.value = false
      }
    }

    const resetTeamsFilters = () => {
      filtersTeams.value = {
        region: '',
        game_modes: [],
        required_roles: [],
        mmr_min: null,
        mmr_max: null,
        tags: [],
        is_searching: true,
        looking_for_scrim: false
      }
      teamsResults.value = []
      teamsSearched.value = false
      handleTeamsSearch()
    }

    const handleTeamsSort = (value) => {
      switch (value) {
        case 'mmr_desc':
          teamsResults.value.sort((a, b) => (b.mmr_range_min || 0) - (a.mmr_range_min || 0))
          break
        case 'mmr_asc':
          teamsResults.value.sort((a, b) => (a.mmr_range_min || 0) - (b.mmr_range_min || 0))
          break
        case 'name_asc':
          teamsResults.value.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name_desc':
          teamsResults.value.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'size':
          teamsResults.value.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
          break
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
        applyDialogVisible.value = false
        selectedTeam.value = null
        ElMessage.success('Заявка отправлена успешно!')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки заявки')
      } finally {
        applying.value = false
      }
    }

    const contactForScrim = async (team) => {
      if (!authStore.user?.team_id) {
        ElMessage.warning('У вас должна быть команда для предложения кв')
        return
      }

      try {
        const room = await chatStore.getOrCreatePrivateRoom(team.captain_id)
        chatStore.setActiveRoom(room.id)
        router.push('/chat')
      } catch (error) {
        ElMessage.error('Ошибка создания чата')
      }
    }

    const handleTeamCreated = () => {
      activeTab.value = 'teams'
      ElMessage.success('Команда создана успешно!')
    }

    // Загружаем команды при монтировании
    onMounted(async () => {
      if (activeTab.value === 'teams') {
        await handleTeamsSearch()
      }
    })

    return {
      authStore,
      REGIONS,
      GAME_MODES,
      ROLES,
      TAGS,
      activeTab,
      filtersTeams,
      teamsResults,
      searchingTeams,
      teamsSearched,
      sortByTeams,
      applyDialogVisible,
      applying,
      applicationForm,
      teamsSearchPresets,
      hasActiveTeamsFilters,
      activeTeamsFiltersCount,
      activeTeamsFiltersList,
      showMobileFilters,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      truncateText,
      toggleTeamsRole,
      removeTeamsFilter,
      applyTeamsPreset,
      handleTeamsSearch,
      resetTeamsFilters,
      handleTeamsSort,
      applyToTeam,
      submitApplication,
      contactForScrim,
      handleTeamCreated
    }
  }
}
</script>

<style scoped>
.teams-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Заголовок страницы */
.page-header {
  background: var(--primary-gradient);
  color: white;
  padding: 40px 0;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.3;
}

.header-content {
  position: relative;
  z-index: 2;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 20px;
}

.header-stats {
  position: absolute;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  z-index: 2;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Основной контент */
.teams-content {
  margin: 0 auto;
  padding: 24px 20px;
}

/* Табы */
.page-tabs {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  margin-bottom: 24px;
}

:deep(.page-tabs .el-tabs__header) {
  margin-bottom: 0;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  padding: 0 24px;
}

:deep(.page-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.page-tabs .el-tabs__item) {
  font-weight: 600;
  color: var(--text-secondary);
  padding: 20px 24px;
  transition: var(--transition-fast);
}

:deep(.page-tabs .el-tabs__item.is-active) {
  color: var(--primary-color);
}

:deep(.page-tabs .el-tabs__active-bar) {
  background: var(--primary-gradient);
  height: 3px;
}

/* Контейнер для фильтров и результатов */
.filters-and-results {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin-top: 20px;
}

/* Боковая панель с фильтрами */
.filters-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Улучшенная кнопка фильтров для мобильных */
.mobile-filters-toggle {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition-normal);
  margin-bottom: 0;
}

.mobile-filters-toggle:hover {
  background: var(--bg-secondary);
  transform: translateY(-1px);
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.toggle-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.toggle-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.toggle-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
}

.filters-count {
  font-size: 0.8rem;
  color: var(--primary-color);
  font-weight: 500;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.mobile-filters-toggle .rotate-180 {
  transform: rotate(180deg);
  transition: transform var(--transition-normal);
  color: var(--text-muted);
}

.filters-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filters-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.filters-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 600;
}

.reset-btn {
  color: var(--primary-color);
  font-weight: 500;
}

.reset-btn:hover {
  color: var(--primary-dark);
}

.filters-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
}

:deep(.filter-select .el-input__inner) {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

:deep(.filter-select .el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: var(--text-muted);
  font-weight: 500;
}

/* Сетка ролей */
.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--bg-secondary);
}

.role-option:hover {
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.role-option.active {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.role-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.role-carry { background: var(--danger-gradient); }
.role-mid { background: var(--primary-gradient); }
.role-offlane { background: var(--warning-gradient); }
.role-support { background: var(--success-gradient); }
.role-hard_support { background: var(--secondary-gradient); }

.role-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
}

.switch-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.switch-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.search-btn {
  width: 100%;
  margin-top: 8px;
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--border-radius);
  padding: 12px 20px;
  font-weight: 600;
  transition: var(--transition-normal);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.search-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* Быстрый поиск */
.quick-search-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.quick-search-card h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.quick-search-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-search-btn {
  justify-content: flex-start;
  padding: 8px 12px;
  color: var(--text-secondary);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-fast);
}

.quick-search-btn:hover {
  color: var(--primary-color);
  background: rgba(102, 126, 234, 0.1);
}

/* Область результатов */
.results-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  background: var(--bg-card);
  padding: 20px 24px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.results-info h3 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.active-filter-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  font-weight: 500;
}

.sort-select {
  width: 200px;
}

:deep(.sort-select .el-input__inner) {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

/* Лоадер */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.loader-content {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  color: var(--primary-color);
  margin-bottom: 16px;
  animation: spin 1.5s linear infinite;
}

.loader-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Сетка команд */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.team-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition-normal);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: var(--transition-normal);
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.team-card:hover::before {
  opacity: 1;
}

.team-card.scrim-team {
  border-left: 4px solid var(--warning-color);
}

.team-card.scrim-team::before {
  background: var(--warning-gradient);
}

/* Заголовок карточки команды */
.team-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.team-avatar {
  position: relative;
  flex-shrink: 0;
  align-self: flex-start;
}

.team-badges {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  gap: 4px;
}

.scrim-badge {
  border: none;
  font-weight: 600;
  font-size: 0.7rem;
  padding: 2px 6px;
}

.team-main-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-fast);
}

.team-name:hover {
  color: var(--primary-color);
}

.team-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-mmr,
.team-region,
.team-size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.team-status {
  flex-shrink: 0;
}

.status-tag {
  border: none;
  font-weight: 500;
}

:deep(.status-tag) {
  border: none;
}

/* Описание команды */
.team-description {
  margin-bottom: 12px;
}

.team-description p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
  font-style: italic;
}

/* Роли команды */
.team-roles {
  margin-bottom: 12px;
}

.roles-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-carry { background: var(--danger-gradient); }
.role-mid { background: var(--primary-gradient); }
.role-offlane { background: var(--warning-gradient); }
.role-support { background: var(--success-gradient); }
.role-hard_support { background: var(--secondary-gradient); }

/* Режимы игры */
.team-modes {
  margin-bottom: 12px;
}

.modes-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.modes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mode-tag {
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

/* Теги */
.team-tags {
  margin-bottom: 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.team-tag {
  border: none;
  background: rgba(243, 147, 251, 0.1);
  color: #f093fb;
  font-weight: 500;
}

/* Действия */
.team-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  min-width: 80px;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  transition: var(--transition-fast);
}

.action-btn:hover {
  transform: translateY(-1px);
}

/* Контейнер создания команды */
.creation-container {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  margin-top: 20px;
}

/* Пустые результаты */
.empty-results,
.initial-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.empty-state,
.initial-content {
  text-align: center;
  padding: 40px;
}

.empty-icon,
.initial-icon {
  font-size: 4rem;
  color: var(--border-color);
  margin-bottom: 20px;
}

.empty-state h4,
.initial-content h4 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.empty-state p,
.initial-content p {
  margin: 0 0 20px 0;
  color: var(--text-muted);
}

/* Диалог приглашения */
.invite-dialog {
  border-radius: var(--border-radius-lg);
}

:deep(.invite-dialog .el-dialog) {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

:deep(.invite-dialog .el-dialog__header) {
  background: var(--primary-gradient);
  color: white;
  margin: 0;
  padding: 20px;
}

:deep(.invite-dialog .el-dialog__title) {
  color: white;
  font-weight: 600;
}

:deep(.invite-dialog .el-dialog__body) {
  padding: 20px;
}

:deep(.invite-dialog .el-dialog__footer) {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

/* ===== АДАПТИВНОСТЬ ===== */

/* Большие экраны (1400px+) */
@media (min-width: 1400px) {
  .teams-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

/* Ноутбуки (1200px - 1024px) */
@media (max-width: 1200px) {
  .filters-and-results {
    grid-template-columns: 280px 1fr;
    gap: 20px;
  }
  
  .teams-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
  
  .filters-card {
    padding: 20px;
  }
}

/* Планшеты (1024px и меньше) - ФИЛЬТРЫ СВЕРХУ */
@media (max-width: 1024px) {
  .filters-and-results {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  /* Фильтры теперь сверху */
  .filters-sidebar {
    order: 1;
  }
  
  .results-area {
    order: 2;
  }
  
  .header-stats {
    position: static;
    transform: none;
    margin-top: 20px;
  }
  
  .stat-item {
    display: inline-block;
  }
  
  /* Улучшенная кнопка фильтров */
  .mobile-filters-toggle {
    display: flex;
    margin-bottom: 0;
  }
  
  .filters-container {
    display: none;
  }
  
  .filters-container.mobile-visible {
    display: flex;
  }
  
  /* На планшетах минимум 2 карточки в строке */
  .teams-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

/* Мобильные устройства (768px и меньше) */
@media (max-width: 768px) {
  .page-header {
    padding: 30px 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .teams-content {
    padding: 15px;
  }
  
  /* На мобильных - 1 карточка в строке, занимает всю ширину */
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .team-card {
    margin: 0;
    width: 100%;
    max-width: none;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .team-header {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .team-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    min-width: 0;
  }
}

/* Средние мобильные (600px - 480px) */
@media (max-width: 600px) {
  .page-header {
    padding: 25px 0;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .page-subtitle {
    font-size: 1rem;
  }
  
  .teams-content {
    padding: 12px;
    gap: 15px;
  }
  
  .filters-card,
  .quick-search-card {
    padding: 16px;
  }
  
  .results-header {
    padding: 16px 20px;
  }
  
  .team-card {
    padding: 20px;
  }

  .results-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .range-inputs {
    flex-direction: column;
    gap: 8px;
  }
  
  .range-separator {
    display: none;
  }
  
  /* На средних мобильных карточка занимает всю доступную ширину */
  .team-card {
    margin: 0;
    width: 100%;
  }
}

/* Маленькие мобильные (480px - 360px) */
@media (max-width: 480px) {
  .page-header {
    padding: 20px 0;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .header-content {
    padding: 0 15px;
  }
  
  .teams-content {
    padding: 10px;
  }
  
  .filters-card,
  .quick-search-card {
    padding: 12px;
  }
  
  .team-card {
    padding: 16px;
    margin: 0;
    width: 100%;
  }
  
  .team-actions {
    flex-direction: row;
  }
  
  .action-btn {
    min-width: 0;
    flex: 1;
  }
  
  .empty-state,
  .initial-content {
    padding: 30px 20px;
  }
  
  .empty-icon,
  .initial-icon {
    font-size: 3rem;
  }
  
  /* Улучшаем отображение кнопки фильтров на маленьких экранах */
  .mobile-filters-toggle {
    padding: 14px 16px;
  }
  
  .toggle-icon {
    font-size: 1.1rem;
  }
  
  .toggle-title {
    font-size: 0.95rem;
  }
  
  .filters-count {
    font-size: 0.75rem;
  }
}

/* Очень маленькие мобильные (< 360px) */
@media (max-width: 360px) {
  .page-title {
    font-size: 1.3rem;
  }
  
  .teams-content {
    padding: 8px;
  }
  
  .team-card {
    padding: 12px;
    margin: 0;
    width: 100%;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-search-buttons {
    gap: 6px;
  }
  
  .quick-search-btn {
    padding: 6px 10px;
    font-size: 0.9rem;
  }
  
  /* На очень маленьких экранах улучшаем отображение контента */
  .team-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .team-status {
    margin-top: 8px;
  }
  
  /* Еще более компактная кнопка фильтров */
  .mobile-filters-toggle {
    padding: 12px 14px;
  }
  
  .toggle-content {
    gap: 10px;
  }
  
  .toggle-icon {
    font-size: 1rem;
  }
}

/* Ландшафтная ориентация для мобильных */
@media (max-height: 500px) and (max-width: 900px) {
  .page-header {
    padding: 20px 0;
  }
  
  .teams-content {
    padding: 15px;
  }
  
  .filters-container.mobile-visible {
    max-height: 70vh;
    overflow-y: auto;
  }
}

/* Высокие экраны */
@media (min-height: 800px) and (max-width: 768px) {
  .empty-results,
  .initial-state,
  .loading-container {
    min-height: 500px;
  }
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .team-card,
  .action-btn,
  .search-btn,
  .role-option,
  .mobile-filters-toggle {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}
</style>