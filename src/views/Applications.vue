<template>
  <div class="applications">
    <el-card>
      <template #header>
        <h2>Мои заявки</h2>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="Активные заявки" name="active">
          <div v-if="activeApplications.length" class="applications-list">
            <div
              v-for="application in activeApplications"
              :key="application.id"
              class="application-item"
            >
              <div class="application-content">
                <div class="application-header">
                  <h4 @click="$router.push(`/teams/${application.team.id}`)" class="team-name">
                    {{ application.team?.name }}
                  </h4>
                  <el-tag :type="getStatusType(application.status)" size="small">
                    {{ getStatusText(application.status) }}
                  </el-tag>
                </div>
                
                <p class="application-message" v-if="application.message">
                  <strong>Ваше сообщение:</strong> {{ application.message }}
                </p>
                
                <div class="application-team-info">
                  <p><strong>Регион:</strong> {{ getRegionLabel(application.team?.region) }}</p>
                  <p><strong>MMR диапазон:</strong> {{ application.team?.mmr_range_min }} - {{ application.team?.mmr_range_max }}</p>
                  <p><strong>Ищут роли:</strong>
                    <el-tag
                      v-for="role in application.team?.required_roles"
                      :key="role"
                      size="small"
                      style="margin-left: 5px;"
                    >
                      {{ getRoleLabel(role) }}
                    </el-tag>
                  </p>
                </div>

                <p class="application-date">
                  Подана: {{ formatDate(application.created_at) }}
                </p>
              </div>

              <div class="application-actions" v-if="application.status === 'pending'">
                <el-button
                  type="danger"
                  size="small"
                  @click="withdrawApplication(application)"
                >
                  Отозвать
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="Нет активных заявок" />
        </el-tab-pane>

        <el-tab-pane label="История заявок" name="history">
          <div v-if="historyApplications.length" class="applications-list">
            <div
              v-for="application in historyApplications"
              :key="application.id"
              class="application-item history"
            >
              <div class="application-content">
                <div class="application-header">
                  <h4 @click="$router.push(`/teams/${application.team.id}`)" class="team-name">
                    {{ application.team.name }}
                  </h4>
                  <el-tag :type="getStatusType(application.status)" size="small">
                    {{ getStatusText(application.status) }}
                  </el-tag>
                </div>
                
                <p class="application-message" v-if="application.message">
                  <strong>Ваше сообщение:</strong> {{ application.message }}
                </p>
                
                <p class="application-date">
                  {{ formatDate(application.created_at) }} • 
                  Обновлено: {{ formatDate(application.updated_at) }}
                </p>
              </div>
            </div>
          </div>
          <el-empty v-else description="Нет завершенных заявок" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useApplicationsStore } from '../stores/applications'
import { REGIONS, ROLES } from '../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Applications',
  setup() {
    const applicationsStore = useApplicationsStore()
    const activeTab = ref('active')

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const getRoleLabel = (roleValue) => {
      const role = ROLES.find(r => r.value === roleValue)
      return role ? role.label : roleValue
    }

    const getStatusType = (status) => {
      const types = {
        'pending': 'warning',
        'accepted': 'success',
        'rejected': 'danger'
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        'pending': 'На рассмотрении',
        'accepted': 'Принята',
        'rejected': 'Отклонена'
      }
      return texts[status] || status
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

    const activeApplications = computed(() => {
      return applicationsStore.myApplications.filter(app => app.status === 'pending') || []
    })
    const historyApplications = computed(() => {
      return applicationsStore.myApplications.filter(app => app.status !== 'pending') || []
    })

    const withdrawApplication = async (application) => {
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите отозвать заявку?',
          'Отзыв заявки',
          {
            confirmButtonText: 'Отозвать',
            cancelButtonText: 'Отмена',
            type: 'warning'
          }
        )

        await applicationsStore.updateApplication(application.id, { status: 'withdrawn' })
        ElMessage.success('Заявка отозвана')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка отзыва заявки')
        }
      }
    }

    onMounted(async () => {
      try {
        await applicationsStore.getMyApplications()
      } catch (error) {
        // Ошибка уже обработана в store
      }
    })

    return {
      activeTab,
      activeApplications,
      historyApplications,
      getRegionLabel,
      getRoleLabel,
      getStatusType,
      getStatusText,
      formatDate,
      withdrawApplication
    }
  }
}
</script>

<style scoped>
.applications {
  max-width: 800px;
  margin: 0 auto;
}

.applications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.application-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s;
}

.application-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.application-item.history {
  opacity: 0.7;
}

.application-content {
  flex: 1;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.team-name {
  margin: 0;
  color: #3498db;
  cursor: pointer;
  font-size: 1.1rem;
}

.team-name:hover {
  text-decoration: underline;
}

.application-message {
  margin: 10px 0;
  color: #5a6c7d;
  font-style: italic;
}

.application-team-info {
  margin: 10px 0;
}

.application-team-info p {
  margin: 5px 0;
  color: #7f8c8d;
}

.application-date {
  margin: 10px 0 0 0;
  color: #95a5a6;
  font-size: 0.9rem;
}

.application-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}
</style>