<template>
  <div class="applications">
    <el-card>
      <template #header>
        <h2>Мои заявки</h2>
      </template>

      <!-- Лоадинг при загрузке -->
      <div v-if="loading" class="loading-container">
        <div class="loader-content">
          <el-icon class="loading-spinner" :size="48"><Loading /></el-icon>
          <p>Загрузка заявок...</p>
        </div>
      </div>

      <!-- Контент после загрузки -->
      <div v-else>
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
                    <h4 @click="$router.push(`/teams/${application.Team.id}`)" class="team-name">
                      {{ application.Team?.name }}
                    </h4>
                    <el-tag :type="getStatusType(application.status)" size="small">
                      {{ getStatusText(application.status) }}
                    </el-tag>
                  </div>
                  
                  <p class="application-message" v-if="application.message">
                    <strong>Ваше сообщение:</strong> {{ application.message }}
                  </p>
                  
                  <div class="application-team-info">
                    <p><strong>Регион:</strong> {{ getRegionLabel(application.Team?.region) }}</p>
                    <p><strong>MMR диапазон:</strong> {{ application.Team?.mmr_range_min }} - {{ application.Team?.mmr_range_max }}</p>
                    <p><strong>Ищут роли:</strong>
                      <el-tag
                        v-for="role in application.Team?.required_roles"
                        :key="role"
                        size="small"
                        style="margin-left: 5px;"
                      >
                        {{ getRoleLabel(role) }}
                      </el-tag>
                    </p>
                  </div>

                  <p class="application-date">
                    Подана: {{ formatDate(application.createdAt) }}
                  </p>

                  <div class="application-actions" v-if="application.status === 'pending'">
                    <el-button
                      type="danger"
                      size="small"
                      @click="withdrawApplication(application)"
                      :loading="application.loading"
                      :disabled="processingWithdrawal"
                    >
                      Отозвать
                    </el-button>
                  </div>
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
                    <h4 @click="$router.push(`/teams/${application.Team.id}`)" class="team-name">
                      {{ application.Team?.name }}
                    </h4>
                    <el-tag :type="getStatusType(application.status)" size="small">
                      {{ getStatusText(application.status) }}
                    </el-tag>
                  </div>
                  
                  <p class="application-message" v-if="application.message">
                    <strong>Ваше сообщение:</strong> {{ application.message }}
                  </p>
                  
                  <p class="application-date">
                    {{ formatDate(application.createdAt) }} • 
                    Обновлено: {{ formatDate(application.updatedAt) }}
                  </p>
                </div>
              </div>
            </div>
            <el-empty v-else description="Нет завершенных заявок" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>

    <!-- Глобальный лоадинг для операций -->
    <div v-if="processingWithdrawal" class="global-loading-overlay">
      <div class="global-loading-content">
        <div class="global-spinner">
          <div class="spinner-ring"></div>
        </div>
        <span class="global-loading-text">
          Отзыв заявки...
        </span>
      </div>
    </div>
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
    const loading = ref(true)
    const processingWithdrawal = ref(false)

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
        'rejected': 'danger',
        'withdrawn': 'info'
      }
      return types[status] || 'info'
    }

    const getStatusText = (status) => {
      const texts = {
        'pending': 'На рассмотрении',
        'accepted': 'Принята',
        'rejected': 'Отклонена',
        'withdrawn': 'Отозвана'
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
      return applicationsStore.myApplications
        .filter(app => app.status === 'pending')
        .map(app => ({ ...app, loading: false })) || []
    })

    const historyApplications = computed(() => {
      return applicationsStore.myApplications
        .filter(app => app.status !== 'pending')
        .map(app => ({ ...app, loading: false })) || []
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

        processingWithdrawal.value = true
        application.loading = true

        await applicationsStore.updateApplication(application.id, { status: 'withdrawn' })
        ElMessage.success('Заявка отозвана')
        
        // Обновляем локальный статус
        application.status = 'withdrawn'
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка отзыва заявки')
        }
      } finally {
        processingWithdrawal.value = false
        application.loading = false
      }
    }

    onMounted(async () => {
      try {
        loading.value = true
        await applicationsStore.getMyApplications()
      } catch (error) {
        ElMessage.error('Ошибка загрузки заявок')
      } finally {
        loading.value = false
      }
    })

    return {
      activeTab,
      loading,
      processingWithdrawal,
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

/* Лоадинг стили */
.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  color: var(--primary-color);
  margin-bottom: 16px;
  animation: spin 1.5s linear infinite;
}

.loading-spinner.large .spinner-dot {
  width: 10px;
  height: 10px;
}

.spinner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner-dot:nth-child(1) { animation-delay: -0.32s; }
.spinner-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Глобальный лоадинг */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.global-loading-content {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-width: 200px;
}

.global-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.global-loading-text {
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Остальные стили */
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
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
  position: relative;
}

.application-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.application-item.history {
  opacity: 0.8;
  background: var(--bg-primary);
}

.application-item.history:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
}

.application-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.application-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.team-name {
  margin: 0;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.team-name:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.application-message {
  margin: 12px 0;
  color: var(--text-primary);
  font-style: italic;
  padding: 12px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--primary-color);
  font-size: 0.9rem;
}

.application-team-info {
  margin: 12px 0;
}

.application-team-info p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.application-date {
  margin: 12px 0 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.application-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  margin-left: auto;
  flex-shrink: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .applications {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .application-item {
    flex-direction: column;
    padding: 16px;
  }
  
  .application-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .application-actions {
    margin-left: 0;
    margin-top: 16px;
    width: 100%;
    justify-content: flex-end;
  }
  
  .loading-container {
    padding: 40px 16px;
  }
  
  .global-loading-content {
    padding: 24px;
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .application-item {
    padding: 12px;
  }
  
  .application-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .application-actions .el-button {
    width: 100%;
  }
  
  .application-team-info p {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>