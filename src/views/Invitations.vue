<template>
  <div class="invitations">
    <el-card>
      <template #header>
        <h2>Мои приглашения</h2>
      </template>

      <!-- Лоадинг при загрузке -->
      <div v-if="loading" class="loading-container">
        <div class="loader-content">
          <el-icon class="loading-spinner" :size="48"><Loading /></el-icon>
          <p>Загрузка приглашений...</p>
        </div>
      </div>

      <!-- Контент после загрузки -->
      <div v-else>
        <div v-if="invitations.length" class="invitations-list">
          <div
            v-for="invitation in invitations"
            :key="invitation.id"
            class="invitation-item"
          >
            <div class="invitation-content">
              <div class="invitation-header">
                <h4 @click="$router.push(`/teams/${invitation.team.id}`)" class="team-name">
                  {{ invitation.team?.name }}
                </h4>
                <el-tag :type="getStatusType(invitation.status)" size="small">
                  {{ getStatusText(invitation.status) }}
                </el-tag>
              </div>
              
              <div class="invitation-team-info">
                <p><strong>Капитан:</strong> {{ invitation.team?.captain?.username }}</p>
                <p><strong>Регион:</strong> {{ getRegionLabel(invitation.team?.region) }}</p>
                <p><strong>MMR диапазон:</strong> {{ invitation.team?.mmr_range_min }} - {{ invitation.team?.mmr_range_max }}</p>
                <p><strong>Состав команды:</strong> {{ invitation.team?.members?.length || 0 }} участников</p>
              </div>

              <p class="invitation-message" v-if="invitation.message">
                <strong>Сообщение от капитана:</strong> {{ invitation.message }}
              </p>

              <p class="invitation-date">
                Получено: {{ formatDate(invitation.createdAt) }}
              </p>
            </div>

            <div class="invitation-actions" v-if="invitation.status === 'pending'">
              <el-button
                type="success"
                size="small"
                @click="handleInvitation(invitation.id, 'accepted')"
                :loading="invitation.loading"
                :disabled="processingInvitation"
              >
                Принять
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleInvitation(invitation.id, 'rejected')"
                :loading="invitation.loading"
                :disabled="processingInvitation"
              >
                Отклонить
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- Пустое состояние -->
        <el-empty v-else description="Нет приглашений" />
      </div>
    </el-card>

    <!-- Глобальный лоадинг для операций -->
    <div v-if="processingInvitation" class="global-loading-overlay">
      <div class="global-loading-content">
        <div class="global-spinner">
          <div class="spinner-ring"></div>
        </div>
        <span class="global-loading-text">
          Обработка приглашения...
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useInvitationsStore } from '../stores/invitations'
import { REGIONS } from '../utils/constants'
import { ElMessage } from 'element-plus'

export default {
  name: 'Invitations',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const invitationsStore = useInvitationsStore()

    const invitations = ref([])
    const loading = ref(true)
    const processingInvitation = ref(false)

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
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
        'accepted': 'Принято',
        'rejected': 'Отклонено'
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

    const handleInvitation = async (invitationId, status) => {
      const invitation = invitations.value.find(inv => inv.id === invitationId)
      if (!invitation) return

      processingInvitation.value = true
      invitation.loading = true
      
      try {
        await invitationsStore.updateInvitation(invitationId, { status })
        
        if (status === 'accepted') {
          // Обновляем данные пользователя
          await authStore.getCurrentUser()
          ElMessage.success('Приглашение принято! Добро пожаловать в команду!')
          router.push('/my-team')
        } else {
          ElMessage.success('Приглашение отклонено')
          // Обновляем статус приглашения локально
          invitation.status = 'rejected'
        }
      } catch (error) {
        ElMessage.error('Ошибка обработки приглашения')
      } finally {
        processingInvitation.value = false
        invitation.loading = false
      }
    }

    onMounted(async () => {
      try {
        loading.value = true
        const invs = await invitationsStore.getMyInvitations()
        invitations.value = invs.invitations.map(inv => ({ ...inv, loading: false }))
      } catch (error) {
        ElMessage.error('Ошибка загрузки приглашений')
      } finally {
        loading.value = false
      }
    })

    return {
      invitations,
      loading,
      processingInvitation,
      getRegionLabel,
      getStatusType,
      getStatusText,
      formatDate,
      handleInvitation
    }
  }
}
</script>

<style scoped>
.invitations {
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
.invitations-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.invitation-item {
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

.invitation-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.invitation-content {
  flex: 1;
}

.invitation-header {
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

.invitation-team-info {
  margin: 12px 0;
}

.invitation-team-info p {
  margin: 6px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.invitation-message {
  margin: 12px 0;
  color: var(--text-primary);
  font-style: italic;
  padding: 12px;
  background-color: var(--bg-primary);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--primary-color);
  font-size: 0.9rem;
}

.invitation-date {
  margin: 12px 0 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.invitation-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  flex-shrink: 0;
}

/* Адаптивность */
@media (max-width: 768px) {
  .invitations {
    max-width: 100%;
    padding: 0 16px;
  }
  
  .invitation-item {
    flex-direction: column;
    padding: 16px;
  }
  
  .invitation-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .invitation-actions {
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
  .invitation-item {
    padding: 12px;
  }
  
  .invitation-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .invitation-actions .el-button {
    width: 100%;
  }
}
</style>