<template>
  <div class="players-page">
    <!-- Заголовок с градиентом -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Поиск игроков</h1>
        <p class="page-subtitle">Найдите идеальных тиммейтов для вашей команды</p>
      </div>
      <div class="header-stats">
        <!-- <div class="stat-item">
          <div class="stat-value">{{ totalPlayers }}</div>
          <div class="stat-label">игроков в активном поиске</div>
        </div> -->
      </div>
    </div>

    <!-- Основной контент -->
    <div class="players-content">
      <!-- Боковая панель с фильтрами -->
      <div class="filters-sidebar">
        <!-- Кнопка для мобильных - показать/скрыть фильтры -->
        <div class="mobile-filters-toggle" @click="showMobileFilters = !showMobileFilters">
          <div class="toggle-content">
            <el-icon class="toggle-icon"><Filter /></el-icon>
            <div class="toggle-text">
              <span class="toggle-title">Фильтры</span>
              <span class="filters-count" v-if="activeFiltersCount > 0">
                {{ activeFiltersCount }} активных
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
                @click="resetFilters" 
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
                  v-model="filters.region"
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
                    v-model="filters.mmr_min"
                    :min="0"
                    :max="10000"
                    placeholder="От"
                    controls-position="right"
                    class="range-input"
                  />
                  <span class="range-separator">—</span>
                  <el-input-number
                    v-model="filters.mmr_max"
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
                  v-model="filters.game_modes"
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

              <!-- Роли -->
              <div class="filter-group">
                <label class="filter-label">Предпочитаемые роли</label>
                <div class="roles-grid">
                  <div
                    v-for="role in ROLES"
                    :key="role.value"
                    class="role-option"
                    :class="{ active: filters.preferred_roles.includes(role.value) }"
                    @click="toggleRole(role.value)"
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
                  v-model="filters.tags"
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
                      v-model="filters.is_online"
                      active-color="var(--primary-color)"
                    />
                    <span class="switch-label">Только онлайн</span>
                  </div>
                  <div class="switch-item">
                    <el-switch
                      v-model="filters.is_searching"
                      active-color="var(--primary-color)"
                    />
                    <span class="switch-label">Только в поиске</span>
                  </div>
                </div>
              </div>

              <!-- Кнопка поиска -->
              <el-button
                type="primary"
                class="search-btn"
                @click="handleSearch"
                :loading="searching"
                :disabled="!hasActiveFilters"
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
                v-for="preset in searchPresets"
                :key="preset.name"
                type="text"
                class="quick-search-btn"
                @click="applyPreset(preset)"
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
            <h3>Найдено игроков: {{ searchResults.length }}</h3>
            <div class="active-filters" v-if="activeFiltersCount > 0">
              <el-tag
                v-for="filter in activeFiltersList"
                :key="filter.key"
                closable
                @close="removeFilter(filter.key)"
                class="active-filter-tag"
              >
                {{ filter.label }}
              </el-tag>
            </div>
          </div>
          <div class="results-controls">
            <el-select
              v-model="sortBy"
              placeholder="Сортировка"
              @change="handleSort"
              class="sort-select"
            >
              <el-option label="По MMR (убывание)" value="mmr_desc" />
              <el-option label="По MMR (возрастание)" value="mmr_asc" />
              <el-option label="По имени (А-Я)" value="name_asc" />
              <el-option label="По имени (Я-А)" value="name_desc" />
              <el-option label="По дате регистрации" value="date" />
            </el-select>
          </div>
        </div>

        <!-- Лоадер при загрузке -->
        <div v-if="searching" class="loading-container">
          <div class="loader-content">
            <el-icon class="loading-spinner" :size="48"><Loading /></el-icon>
            <p>Поиск игроков...</p>
          </div>
        </div>

        <!-- Сетка игроков -->
        <div v-else-if="searchResults.length > 0" class="players-grid">
          <div
            v-for="player in searchResults"
            :key="player.id"
            class="player-card"
          >
            <!-- Заголовок карточки -->
            <div class="player-header">
              <div class="player-avatar">
                <el-avatar :size="64" :src="player.avatar_url ? player.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" />
                <div 
                  class="online-indicator" 
                  :class="{ online: isUserOnline(player.last_online) }"
                ></div>
              </div>
              <div class="player-main-info">
                <h4 
                  @click="$router.push(`/users/${player.id}`)" 
                  class="player-name"
                >
                  {{ player.username }}
                </h4>
                <div class="player-meta">
                  <span class="player-mmr">
                    <el-icon><TrendCharts /></el-icon>
                    {{ player.mmr_rating || 'Не указан' }} MMR
                  </span>
                  <span class="player-region">
                    <el-icon><Location /></el-icon>
                    {{ getRegionLabel(player.region) }}
                  </span>
                </div>
              </div>
              <div class="player-status">
                <el-tag 
                  :type="player.is_searching ? 'success' : 'info'" 
                  class="status-tag"
                >
                  {{ player.is_searching ? 'В поиске' : 'Не активен' }}
                </el-tag>
              </div>
            </div>

            <!-- Роли игрока -->
            <div class="player-roles">
              <div class="roles-label">Роли:</div>
              <div class="roles-list">
                <div
                  v-for="role in player.preferred_roles"
                  :key="role"
                  class="role-badge"
                  :class="`role-${role}`"
                >
                  {{ getRoleLabel(role) }}
                </div>
              </div>
            </div>

            <!-- Режимы игры -->
            <div class="player-modes" v-if="player.game_modes && player.game_modes.length">
              <div class="modes-label">Режимы:</div>
              <div class="modes-list">
                <el-tag
                  v-for="mode in player.game_modes.slice(0, 3)"
                  :key="mode"
                  size="small"
                  class="mode-tag"
                >
                  {{ getGameModeLabel(mode) }}
                </el-tag>
                <el-tag 
                  v-if="player.game_modes.length > 3" 
                  size="small" 
                  type="info"
                >
                  +{{ player.game_modes.length - 3 }}
                </el-tag>
              </div>
            </div>

            <!-- Теги -->
            <div class="player-tags" v-if="player.tags && player.tags.length">
              <div class="tags-list">
                <el-tag
                  v-for="tag in player.tags.slice(0, 4)"
                  :key="tag"
                  size="small"
                  type="warning"
                  class="player-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>

            <!-- О себе -->
            <div class="player-about" v-if="player.about_me">
              <p>{{ truncateText(player.about_me, 120) }}</p>
            </div>

            <!-- Действия -->
            <div class="player-actions">
              <el-button
                type="primary"
                size="small"
                @click="startChat(player.id)"
                :disabled="player.id === authStore.user?.id || player.is_blocked"
                class="action-btn"
              >
                Написать
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button
                size="small"
                @click="$router.push(`/users/${player.id}`)"
                class="action-btn"
              >
                Профиль
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                v-if="authStore.user?.team_id && authStore.user?.team_id !== player.team_id"
                type="success"
                size="small"
                @click="inviteToTeam(player)"
                class="action-btn"
              >
                <el-icon><Plus /></el-icon>
                Пригласить
              </el-button>
            </div>
          </div>
        </div>

        <!-- Состояние пустых результатов -->
        <div v-else-if="searched && searchResults.length === 0" class="empty-results">
          <div class="empty-state">
            <el-icon class="empty-icon"><Search /></el-icon>
            <h4>Игроки не найдены</h4>
            <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
            <el-button type="primary" @click="resetFilters">
              Сбросить фильтры
            </el-button>
          </div>
        </div>

        <!-- Начальное состояние (до поиска) -->
        <div v-else class="initial-state">
          <div class="initial-content">
            <el-icon class="initial-icon"><User /></el-icon>
            <h4>Начните поиск игроков</h4>
            <p>Используйте фильтры, чтобы найти подходящих тиммейтов</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Диалог приглашения в команду -->
    <el-dialog
      v-model="inviteDialogVisible"
      title="Пригласить в команду"
      width="500px"
      class="invite-dialog"
    >
      <el-form :model="inviteForm">
        <el-form-item label="Сообщение">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="4"
            placeholder="Напишите сообщение для приглашения..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inviteDialogVisible = false">Отмена</el-button>
        <el-button 
          type="primary" 
          @click="sendInvitation" 
          :loading="sendingInvitation"
        >
          Отправить приглашение
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUsersStore } from '../stores/users'
import { useChatStore } from '../stores/chat'
import { useInvitationsStore } from '../stores/invitations'
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
  name: 'Players',
  components: {
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
    const router = useRouter()
    const authStore = useAuthStore()
    const usersStore = useUsersStore()
    const chatStore = useChatStore()
    const invitationsStore = useInvitationsStore()

    const filters = ref({
      region: '',
      game_modes: [],
      preferred_roles: [],
      mmr_min: null,
      mmr_max: null,
      tags: [],
      is_online: false,
      is_searching: true
    })

    const searchResults = ref([])
    const searching = ref(false)
    const searched = ref(false)
    const sortBy = ref('mmr_desc')
    const totalPlayers = ref(0)
    const inviteDialogVisible = ref(false)
    const sendingInvitation = ref(false)
    const selectedPlayer = ref(null)
    const showMobileFilters = ref(false)

    const inviteForm = ref({
      message: ''
    })

    // Пресеты для быстрого поиска
    const searchPresets = ref([
      {
        name: 'Высокий MMR',
        filters: { mmr_min: 5000, is_searching: true }
      },
      {
        name: 'Поддержки',
        filters: { preferred_roles: ['support', 'hard_support'], is_searching: true }
      },
      {
        name: 'Керри/Мид',
        filters: { preferred_roles: ['carry', 'mid'], is_searching: true }
      },
      {
        name: 'Онлайн',
        filters: { is_online: true, is_searching: true }
      }
    ])

    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value => {
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === 'number') return value !== null
        return !!value
      })
    })

    const activeFiltersCount = computed(() => {
      let count = 0
      Object.entries(filters.value).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          count += value.length
        } else if (value !== null && value !== '' && value !== false) {
          count++
        }
      })
      return count
    })

    const activeFiltersList = computed(() => {
      const active = []
      
      if (filters.value.region) {
        active.push({
          key: 'region',
          label: `Регион: ${getRegionLabel(filters.value.region)}`
        })
      }

      if (filters.value.mmr_min || filters.value.mmr_max) {
        const min = filters.value.mmr_min || '0'
        const max = filters.value.mmr_max || '∞'
        active.push({
          key: 'mmr',
          label: `MMR: ${min}-${max}`
        })
      }

      if (filters.value.game_modes.length > 0) {
        active.push({
          key: 'game_modes',
          label: `Режимы: ${filters.value.game_modes.length}`
        })
      }

      if (filters.value.preferred_roles.length > 0) {
        active.push({
          key: 'preferred_roles',
          label: `Роли: ${filters.value.preferred_roles.length}`
        })
      }

      if (filters.value.tags.length > 0) {
        active.push({
          key: 'tags',
          label: `Теги: ${filters.value.tags.length}`
        })
      }

      if (filters.value.is_online) {
        active.push({ key: 'is_online', label: 'Только онлайн' })
      }

      if (filters.value.is_searching) {
        active.push({ key: 'is_searching', label: 'В поиске' })
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

    const isUserOnline = (lastOnline) => {
      if (!lastOnline) return false
      const lastOnlineDate = new Date(lastOnline)
      const now = new Date()
      return (now - lastOnlineDate) < 5 * 60 * 1000 // 5 минут
    }

    const truncateText = (text, length) => {
      if (!text) return ''
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    const toggleRole = (role) => {
      const index = filters.value.preferred_roles.indexOf(role)
      if (index > -1) {
        filters.value.preferred_roles.splice(index, 1)
      } else {
        filters.value.preferred_roles.push(role)
      }
    }

    const removeFilter = (filterKey) => {
      switch (filterKey) {
        case 'region':
          filters.value.region = ''
          break
        case 'mmr':
          filters.value.mmr_min = null
          filters.value.mmr_max = null
          break
        case 'game_modes':
          filters.value.game_modes = []
          break
        case 'preferred_roles':
          filters.value.preferred_roles = []
          break
        case 'tags':
          filters.value.tags = []
          break
        case 'is_online':
          filters.value.is_online = false
          break
        case 'is_searching':
          filters.value.is_searching = true
          break
      }
      handleSearch()
    }

    const applyPreset = (preset) => {
      filters.value = { ...filters.value, ...preset.filters }
      handleSearch()
    }

    const handleSearch = async () => {
      searching.value = true
      searched.value = true
      showMobileFilters.value = false
      
      try {
        // Очищаем пустые параметры
        const params = {}
        Object.keys(filters.value).forEach(key => {
          const value = filters.value[key]
          if (value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
            params[key] = value
          }
        })

        await usersStore.searchUsers(params)
        searchResults.value = usersStore.searchResults
        totalPlayers.value = searchResults.value.length
      } catch (error) {
        console.error('Search error:', error)
        ElMessage.error('Ошибка поиска игроков')
      } finally {
        searching.value = false
      }
    }

    const resetFilters = () => {
      filters.value = {
        region: '',
        game_modes: [],
        preferred_roles: [],
        mmr_min: null,
        mmr_max: null,
        tags: [],
        is_online: false,
        is_searching: true
      }
      searchResults.value = []
      searched.value = false
      handleSearch()
    }

    const handleSort = (value) => {
      switch (value) {
        case 'mmr_desc':
          searchResults.value.sort((a, b) => (b.mmr_rating || 0) - (a.mmr_rating || 0))
          break
        case 'mmr_asc':
          searchResults.value.sort((a, b) => (a.mmr_rating || 0) - (b.mmr_rating || 0))
          break
        case 'name_asc':
          searchResults.value.sort((a, b) => a.username.localeCompare(b.username))
          break
        case 'name_desc':
          searchResults.value.sort((a, b) => b.username.localeCompare(a.username))
          break
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

    const inviteToTeam = (player) => {
      if (!authStore.user?.team_id) {
        ElMessage.warning('У вас нет команды для приглашения')
        return
      }
      selectedPlayer.value = player
      inviteForm.value.message = ''
      inviteDialogVisible.value = true
    }

    const sendInvitation = async () => {
      if (!selectedPlayer.value) return

      sendingInvitation.value = true
      try {
        await invitationsStore.inviteUser(selectedPlayer.value.id, {
          teamId: authStore.user.team_id,
          message: inviteForm.value.message
        })
        inviteDialogVisible.value = false
        selectedPlayer.value = null
        ElMessage.success('Приглашение отправлено!')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки приглашения')
      } finally {
        sendingInvitation.value = false
      }
    }

    // Загружаем игроков при монтировании
    onMounted(async () => {
      await handleSearch()
    })

    return {
      authStore,
      REGIONS,
      GAME_MODES,
      ROLES,
      TAGS,
      filters,
      searchResults,
      searching,
      searched,
      sortBy,
      totalPlayers,
      inviteDialogVisible,
      sendingInvitation,
      inviteForm,
      searchPresets,
      hasActiveFilters,
      activeFiltersCount,
      activeFiltersList,
      showMobileFilters,
      getRegionLabel,
      getGameModeLabel,
      getRoleLabel,
      isUserOnline,
      truncateText,
      toggleRole,
      removeFilter,
      applyPreset,
      handleSearch,
      resetFilters,
      handleSort,
      startChat,
      inviteToTeam,
      sendInvitation
    }
  }
}
</script>

<style scoped>
.players-page {
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
.players-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  margin: 0 auto;
  padding: 24px 20px;
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

/* Сетка игроков */
.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.player-card {
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
  width: 100%;
}

.player-card::before {
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

.player-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.player-card:hover::before {
  opacity: 1;
}

/* Заголовок карточки игрока */
.player-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  width: 100%;
}

.player-avatar {
  position: relative;
  flex-shrink: 0;
  align-self: flex-start;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e74c3c;
  border: 2px solid white;
}

.online-indicator.online {
  background: #27ae60;
}

.player-main-info {
  flex: 1;
  min-width: 0;
  width: 100%;
}

.player-name {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-align: start;
  transition: var(--transition-fast);
  width: 100%;
}

.player-name:hover {
  color: var(--primary-color);
}

.player-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.player-mmr,
.player-region {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
  width: 100%;
}

.player-status {
  flex-shrink: 0;
  align-self: flex-start;
}

.status-tag {
  border: none;
  font-weight: 500;
}

:deep(.status-tag) {
  border: none;
}

/* Роли игрока */
.player-roles {
  margin-bottom: 12px;
  width: 100%;
}

.roles-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
  width: 100%;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.role-carry { background: var(--danger-gradient); }
.role-mid { background: var(--primary-gradient); }
.role-offlane { background: var(--warning-gradient); }
.role-support { background: var(--success-gradient); }
.role-hard_support { background: var(--secondary-gradient); }

/* Режимы игры */
.player-modes {
  margin-bottom: 12px;
  width: 100%;
}

.modes-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
  width: 100%;
}

.modes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.mode-tag {
  border: none;
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
  font-weight: 500;
}

/* Теги */
.player-tags {
  margin-bottom: 12px;
  width: 100%;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
}

.player-tag {
  border: none;
  background: rgba(243, 147, 251, 0.1);
  color: #f093fb;
  font-weight: 500;
}

/* О себе */
.player-about {
  margin-bottom: 16px;
  width: 100%;
}

.player-about p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
  font-style: italic;
  width: 100%;
}

/* Действия */
.player-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
  width: 100%;
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
  width: 100%;
}

.empty-state,
.initial-content {
  text-align: center;
  padding: 40px;
  width: 100%;
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
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
}

/* Ноутбуки (1200px - 1024px) */
@media (max-width: 1200px) {
  .players-content {
    grid-template-columns: 280px 1fr;
    gap: 20px;
    padding: 20px;
  }
  
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
  
  .filters-card {
    padding: 20px;
  }
}

/* Планшеты (1024px и меньше) - ФИЛЬТРЫ СВЕРХУ */
@media (max-width: 1024px) {
  .players-content {
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
  .players-grid {
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
  
  .players-content {
    padding: 15px;
  }
  
  /* На мобильных - 1 карточка в строке, занимает всю ширину */
  .players-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .player-card {
    margin: 0;
    width: 100%;
    max-width: none;
  }
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .player-header {
    flex-direction: row;
    text-align: left;
    align-items: flex-start;
  }
  
  .player-actions {
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
  
  .players-content {
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
  
  .player-card {
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
  .player-card {
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
  
  .players-content {
    padding: 10px;
  }
  
  .filters-card,
  .quick-search-card {
    padding: 12px;
  }
  
  .player-card {
    padding: 16px;
    margin: 0;
    width: 100%;
  }
  
  .player-actions {
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
  
  .players-content {
    padding: 8px;
  }
  
  .player-card {
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
  .player-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .player-status {
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
  
  .players-content {
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
  .player-card,
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