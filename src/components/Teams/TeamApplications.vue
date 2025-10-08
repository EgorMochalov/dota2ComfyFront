<template>
  <div class="team-applications">
    <el-card>
      <template #header>
        <div class="applications-header">
          <h3>Заявки в команду</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="loadApplications"
            :loading="loading"
          >
            Обновить
          </el-button>
        </div>
      </template>

      <div v-if="applications.length" class="applications-list">
        <div
          v-for="application in applications"
          :key="application.id"
          class="application-item"
        >
          <div class="application-content">
            <div class="applicant-info">
              <el-avatar :size="50" :src="application.user.avatar_url" />
              <div class="applicant-details">
                <h4 
                  @click="$router.push(`/users/${application.user.id}`)" 
                  class="applicant-name"
                >
                  {{ application.user.username }}
                </h4>
                <div class="applicant-stats">
                  <span>MMR: {{ application.user.mmr_rating || 'Не указан' }}</span>
                  <span>Регион: {{ getRegionLabel(application.user.region) }}</span>
                  <span>Роли: 
                    <el-tag
                      v-for="role in application.user.preferred_roles"
                      :key="role"
                      size="small"
                    >
                      {{ getRoleLabel(role) }}
                    </el-tag>
                  </span>
                </div>
                <div class="application-message" v-if="application.message">
                  <strong>Сообщение:</strong> {{ application.message }}
                </div>
                <div class="application-date">
                  Подана: {{ formatDate(application.created_at) }}
                </div>
              </div>
            </div>

            <div class="application-actions">
              <el-button
                type="success"
                size="small"
                @click="handleApplication(application.id, 'accepted')"
                :loading="application.loading"
                :disabled="!canManageApplications"
              >
                Принять
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleApplication(application.id, 'rejected')"
                :loading="application.loading"
                :disabled="!canManageApplications"
              >
                Отклонить
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <el-empty v-else description="Нет заявок в команду" />
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useTeamsStore } from '../../stores/teams'
import { useApplicationsStore } from '../../stores/applications'
import { useAuthStore } from '../../stores/auth'
import { REGIONS, ROLES } from '../../utils/constants'
import { ElMessage } from 'element-plus'

export default {
  name: 'TeamApplications',
  props: {
    teamId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const teamsStore = useTeamsStore()
    const applicationsStore = useApplicationsStore()
    const authStore = useAuthStore()

    const applications = ref([])
    const loading = ref(false)

    const canManageApplications = computed(() => {
      return teamsStore.currentTeam?.captain_id === authStore.user?.id
    })

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const getRoleLabel = (roleValue) => {
      const role = ROLES.find(r => r.value === roleValue)
      return role ? role.label : roleValue
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadApplications = async () => {
      if (!canManageApplications.value) return
      
      loading.value = true
      try {
        await teamsStore.getTeamApplications(props.teamId)
        applications.value = teamsStore.teamApplications.map(app => ({ 
          ...app, 
          loading: false 
        }))
      } catch (error) {
        ElMessage.error('Ошибка загрузки заявок')
      } finally {
        loading.value = false
      }
    }

    const handleApplication = async (applicationId, status) => {
      const application = applications.value.find(app => app.id === applicationId)
      if (!application) return

      application.loading = true
      try {
        await applicationsStore.updateApplication(applicationId, { status })
        
        // Удаляем обработанную заявку из списка
        applications.value = applications.value.filter(app => app.id !== applicationId)
        
        // Обновляем данные команды
        await teamsStore.getTeam(props.teamId)
        
        ElMessage.success(`Заявка ${status === 'accepted' ? 'принята' : 'отклонена'}`)
      } catch (error) {
        ElMessage.error('Ошибка обработки заявки')
      } finally {
        application.loading = false
      }
    }

    onMounted(() => {
      if (canManageApplications.value) {
        loadApplications()
      }
    })

    return {
      applications,
      loading,
      canManageApplications,
      getRegionLabel,
      getRoleLabel,
      formatDate,
      loadApplications,
      handleApplication
    }
  }
}
</script>

<style scoped>
.team-applications {
  margin-top: 20px;
}

.applications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.application-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.3s;
}

.application-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.application-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.applicant-info {
  display: flex;
  gap: 15px;
  flex: 1;
}

.applicant-details {
  flex: 1;
}

.applicant-name {
  margin: 0 0 10px 0;
  color: #3498db;
  cursor: pointer;
  font-size: 1.1rem;
}

.applicant-name:hover {
  text-decoration: underline;
}

.applicant-stats {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.applicant-stats span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.applicant-stats .el-tag {
  margin-left: 5px;
}

.application-message {
  margin: 10px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
  color: #5a6c7d;
  font-style: italic;
}

.application-date {
  color: #95a5a6;
  font-size: 0.8rem;
}

.application-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>