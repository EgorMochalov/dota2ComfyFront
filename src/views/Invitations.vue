<template>
  <div class="invitations">
    <el-card>
      <template #header>
        <h2>Мои приглашения</h2>
      </template>
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
              Получено: {{ formatDate(invitation.created_at) }}
            </p>
          </div>

          <div class="invitation-actions" v-if="invitation.status === 'pending'">
            <el-button
              type="success"
              size="small"
              @click="handleInvitation(invitation.id, 'accepted')"
              :loading="invitation.loading"
            >
              Принять
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleInvitation(invitation.id, 'rejected')"
              :loading="invitation.loading"
            >
              Отклонить
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="Нет приглашений" />
    </el-card>
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
        }
      } catch (error) {
        ElMessage.error('Ошибка обработки приглашения')
      } finally {
        invitation.loading = false
      }
    }

    onMounted(async () => {
      try {
        const invs = await invitationsStore.getMyInvitations()
        invitations.value = invs.invitations.map(inv => ({ ...inv, loading: false }))
      } catch (error) {
        // Ошибка уже обработана в store
      }
    })

    return {
      invitations,
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
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: box-shadow 0.3s;
}

.invitation-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.invitation-content {
  flex: 1;
}

.invitation-header {
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

.invitation-team-info {
  margin: 10px 0;
}

.invitation-team-info p {
  margin: 5px 0;
  color: #7f8c8d;
}

.invitation-message {
  margin: 10px 0;
  color: #5a6c7d;
  font-style: italic;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

.invitation-date {
  margin: 10px 0 0 0;
  color: #95a5a6;
  font-size: 0.9rem;
}

.invitation-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
}
</style>