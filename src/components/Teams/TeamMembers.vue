<template>
  <div class="team-members">
    <el-card>
      <template #header>
        <h3>Участники команды</h3>
      </template>

      <div class="members-list">
        <div
          v-for="member in team.members"
          :key="member.id"
          class="member-card"
        >
          <div class="member-info">
            <el-avatar :size="50" :src="member.avatar_url ? member.avatar_url : 'https://cdn-icons-png.flaticon.com/512/3237/3237472.png'" />
            <div class="member-details">
              <h4 
                @click="$router.push(`/users/${member.id}`)" 
                class="member-name"
              >
                {{ member.username }}
                <el-tag v-if="member.id === team.captain_id" size="small" type="success">
                  Капитан
                </el-tag>
              </h4>
              <div class="member-stats">
                <span>MMR: {{ member.mmr_rating || 'Не указан' }}</span>
                <span>Регион: {{ getRegionLabel(member.region) }}</span>
                <span>
                  Роли: 
                  <el-tag
                    v-for="role in member.preferred_roles"
                    :key="role"
                    size="small"
                  >
                    {{ getRoleLabel(role) }}
                  </el-tag>
                </span>
              </div>
              <div class="member-status">
                <el-tag 
                  v-if="isUserOnline(member.last_online)" 
                  type="success" 
                  size="small"
                >
                  Online
                </el-tag>
                <el-tag v-else type="info" size="small">
                  Offline
                </el-tag>
              </div>
            </div>
          </div>

          <div class="member-actions" v-if="isCaptain && member.id !== team.captain.id">
            <el-button
              type="primary"
              size="small"
              @click="transferCaptain(member)"
            >
              Сделать капитаном
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="removeMember(member)"
            >
              Удалить
            </el-button>
          </div>
        </div>
      </div>

      <div class="members-stats">
        <div class="stat">
          <span class="stat-value">{{ team.members?.length || 0 }}/5</span>
          <span class="stat-label">Участников</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ onlineMembersCount }}</span>
          <span class="stat-label">Online</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ averageMMR }}</span>
          <span class="stat-label">Средний MMR</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTeamsStore } from '../../stores/teams'
import { REGIONS, ROLES } from '../../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'TeamMembers',
  props: {
    team: {
      type: Object,
      required: true
    },
    isCaptain: {
      type: Boolean,
      default: false
    }
  },
  emits: ['member-removed', 'captain-transferred'],
  setup(props, { emit }) {
    const teamsStore = useTeamsStore()

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
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

    const onlineMembersCount = computed(() => {
      return props.team.members?.filter(member => isUserOnline(member.last_online)).length || 0
    })

    const averageMMR = computed(() => {
      const membersWithMMR = props.team.members?.filter(member => member.mmr_rating) || []
      if (membersWithMMR.length === 0) return 0
      
      const totalMMR = membersWithMMR.reduce((sum, member) => sum + member.mmr_rating, 0)
      return Math.round(totalMMR / membersWithMMR.length)
    })

    const transferCaptain = async (member) => {
      try {
        await ElMessageBox.confirm(
          `Вы уверены, что хотите передать капитана пользователю ${member.username}?`,
          'Передача капитана',
          {
            confirmButtonText: 'Передать',
            cancelButtonText: 'Отмена',
            type: 'warning'
          }
        )

        await teamsStore.transferCaptain(props.team.id, member.id)
        emit('captain-transferred')
        ElMessage.success('Капитан успешно передан')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка передачи капитана')
        }
      }
    }

    const removeMember = async (member) => {
      try {
        await ElMessageBox.confirm(
          `Вы уверены, что хотите удалить ${member.username} из команды?`,
          'Удаление участника',
          {
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            type: 'warning'
          }
        )

        await teamsStore.removeMember(props.team.id, member.id)
        emit('member-removed')
        ElMessage.success('Участник удален из команды')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка удаления участника')
        }
      }
    }

    return {
      getRegionLabel,
      getRoleLabel,
      isUserOnline,
      onlineMembersCount,
      averageMMR,
      transferCaptain,
      removeMember
    }
  }
}
</script>

<style scoped>
.team-members {
  margin-bottom: 20px;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s;
}

.member-card:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.member-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.member-details {
  flex: 1;
}

.member-name {
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #3498db;
}

.member-name:hover {
  text-decoration: underline;
}

.member-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.member-stats span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.member-stats .el-tag {
  margin-left: 5px;
}

.member-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.members-stats {
  display: flex;
  gap: 30px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}
</style>