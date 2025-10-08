<template>
  <div class="team-invitations">
    <el-card>
      <template #header>
        <div class="invitations-header">
          <h3>Пригласить игроков в команду</h3>
        </div>
      </template>

      <el-form :model="searchForm" class="search-form">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item>
              <el-input
                v-model="searchForm.query"
                placeholder="Введите имя пользователя или email для поиска"
                @keyup.enter="searchPlayers"
              >
                <template #append>
                  <el-button 
                    type="primary" 
                    @click="searchPlayers"
                    :loading="searching"
                  >
                    Поиск
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div v-if="searchResults.length" class="search-results">
        <h4>Найдено игроков: {{ searchResults.length }}</h4>
        <div class="players-list">
          <div
            v-for="player in searchResults"
            :key="player.id"
            class="player-item"
          >
            <div class="player-info">
              <el-avatar :size="50" :src="player.avatar_url" />
              <div class="player-details">
                <h5 @click="$router.push(`/users/${player.id}`)" class="player-name">
                  {{ player.username }}
                </h5>
                <div class="player-stats">
                  <span>MMR: {{ player.mmr_rating || 'Не указан' }}</span>
                  <span>Регион: {{ getRegionLabel(player.region) }}</span>
                  <span v-if="player.team_id" class="has-team">Уже в команде</span>
                  <span v-else class="no-team">Свободен</span>
                </div>
                <div class="player-roles">
                  <el-tag
                    v-for="role in player.preferred_roles"
                    :key="role"
                    size="small"
                  >
                    {{ getRoleLabel(role) }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="player-actions">
              <el-button
                type="primary"
                size="small"
                @click="invitePlayer(player)"
                :loading="player.loading"
                :disabled="player.team_id || player.id === authStore.user?.id"
              >
                {{ player.team_id ? 'В команде' : 'Пригласить' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-empty 
        v-else-if="searched" 
        description="Игроки не найдены" 
      />
    </el-card>

    <!-- Диалог приглашения -->
    <el-dialog
      v-model="inviteDialogVisible"
      :title="`Пригласить ${selectedPlayer?.username} в команду`"
      width="500px"
    >
      <el-form :model="inviteForm">
        <el-form-item label="Сообщение">
          <el-input
            v-model="inviteForm.message"
            type="textarea"
            :rows="4"
            placeholder="Напишите сообщение для приглашения"
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
import { ref, computed } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useInvitationsStore } from '../../stores/invitations'
import { useAuthStore } from '../../stores/auth'
import { REGIONS, ROLES } from '../../utils/constants'
import { ElMessage } from 'element-plus'

export default {
  name: 'TeamInvitations',
  props: {
    teamId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const usersStore = useUsersStore()
    const invitationsStore = useInvitationsStore()
    const authStore = useAuthStore()

    const searchForm = ref({
      query: ''
    })
    const searchResults = ref([])
    const searching = ref(false)
    const searched = ref(false)
    const inviteDialogVisible = ref(false)
    const sendingInvitation = ref(false)
    const selectedPlayer = ref(null)

    const inviteForm = ref({
      message: ''
    })

    const canInvitePlayers = computed(() => {
      return authStore.user?.team_id === props.teamId && 
             authStore.user?.id === usersStore.currentTeam?.captain_id
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const getRoleLabel = (roleValue) => {
      const role = ROLES.find(r => r.value === roleValue)
      return role ? role.label : roleValue
    }

    const searchPlayers = async () => {
      if (!searchForm.value.query.trim()) {
        ElMessage.warning('Введите запрос для поиска')
        return
      }

      searching.value = true
      searched.value = true
      try {
        const results = await usersStore.searchUsers({
          query: searchForm.value.query,
          limit: 10
        })
        searchResults.value = results.map(player => ({ ...player, loading: false }))
      } catch (error) {
        ElMessage.error('Ошибка поиска игроков')
      } finally {
        searching.value = false
      }
    }

    const invitePlayer = (player) => {
      if (!canInvitePlayers.value) {
        ElMessage.warning('Только капитан команды может приглашать игроков')
        return
      }

      selectedPlayer.value = player
      inviteForm.value.message = `Привет! Я приглашаю тебя присоединиться к нашей команде "${usersStore.currentTeam?.name}".`
      inviteDialogVisible.value = true
    }

    const sendInvitation = async () => {
      if (!selectedPlayer.value) return

      sendingInvitation.value = true
      try {
        await invitationsStore.inviteUser(selectedPlayer.value.id, {
          teamId: props.teamId,
          message: inviteForm.value.message
        })
        
        // Обновляем статус игрока в результатах поиска
        const playerIndex = searchResults.value.findIndex(p => p.id === selectedPlayer.value.id)
        if (playerIndex !== -1) {
          searchResults.value[playerIndex].loading = false
          searchResults.value[playerIndex].invited = true
        }
        
        inviteDialogVisible.value = false
        selectedPlayer.value = null
        ElMessage.success('Приглашение отправлено!')
      } catch (error) {
        ElMessage.error(error.response?.data?.message || 'Ошибка отправки приглашения')
      } finally {
        sendingInvitation.value = false
      }
    }

    return {
      authStore,
      searchForm,
      searchResults,
      searching,
      searched,
      inviteDialogVisible,
      sendingInvitation,
      selectedPlayer,
      inviteForm,
      canInvitePlayers,
      getRegionLabel,
      getRoleLabel,
      searchPlayers,
      invitePlayer,
      sendInvitation
    }
  }
}
</script>

<style scoped>
.team-invitations {
  margin-top: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.search-results h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.player-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s;
}

.player-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.player-info {
  display: flex;
  gap: 15px;
  align-items: center;
  flex: 1;
}

.player-details {
  flex: 1;
}

.player-name {
  margin: 0 0 5px 0;
  color: #3498db;
  cursor: pointer;
}

.player-name:hover {
  text-decoration: underline;
}

.player-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.player-stats span {
  color: #7f8c8d;
}

.player-stats .has-team {
  color: #e74c3c;
}

.player-stats .no-team {
  color: #27ae60;
}

.player-roles {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
</style>