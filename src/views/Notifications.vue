<template>
  <div class="notifications">
    <el-card>
      <template #header>
        <div class="notifications-header">
          <h2>Уведомления</h2>
          <div class="header-actions">
            <el-button
              type="primary"
              text
              @click="markAllAsRead"
              :loading="markingAllAsRead"
              :disabled="unreadCount === 0"
              class="mark-all-btn"
            >
              <span class="btn-text">Отметить все как прочитанные</span>
              <el-icon class="btn-icon"><Check /></el-icon>
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <div class="loader-content">
          <el-icon class="loading-spinner" :size="48"><Loading /></el-icon>
          <p>Загрузка уведомлений...</p>
        </div>
      </div>

      <el-tabs v-else v-model="activeTab" class="notifications-tabs">
        <el-tab-pane label="Все уведомления" name="all">
          <NotificationsList
            :loading="loading"
            :notifications="notificationsStore.notifications"
            @mark-as-read="markAsRead"
          />
        </el-tab-pane>
        <el-tab-pane label="Непрочитанные" name="unread">
          <NotificationsList
            :notifications="unreadNotifications"
            @mark-as-read="markAsRead"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useNotificationsStore } from '../stores/notifications'
import NotificationsList from '../components/Notifications/NotificationsList.vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Notifications',
  components: {
    NotificationsList
  },
  setup() {
    const notificationsStore = useNotificationsStore()
    const activeTab = ref('all')
    const markingAllAsRead = ref(false)
    const loading = ref(true)

    const unreadNotifications = computed(() => {
      return notificationsStore.notifications.filter(n => !n.is_read)
    })

    const unreadCount = computed(() => notificationsStore.unreadCount)

    const markAsRead = async (notificationId) => {
      try {
        await notificationsStore.markAsRead(notificationId)
      } catch (error) {
        ElMessage.error('Ошибка отметки уведомления как прочитанного')
      }
    }

    const markAllAsRead = async () => {
      markingAllAsRead.value = true
      try {
        await notificationsStore.markAllAsRead()
        ElMessage.success('Все уведомления отмечены как прочитанные')
      } catch (error) {
        ElMessage.error('Ошибка отметки всех уведомлений как прочитанных')
      } finally {
        markingAllAsRead.value = false
      }
    }

    onMounted(async () => {
      try {
        loading.value = true
        await notificationsStore.getNotifications()
        loading.value = false
      } catch (error) {
        // Ошибка уже обработана в store
      }
    })

    return {
      notificationsStore,
      activeTab,
      markingAllAsRead,
      unreadNotifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      loading
    }
  }
}
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.notifications-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-text {
  display: inline-block;
}

.btn-icon {
  display: none;
}

.loading-container {
  padding: 40px 0;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.loading-spinner {
  color: var(--primary-color);
  margin-bottom: 16px;
  animation: spin 1.5s linear infinite;
}

:deep(.notifications-tabs .el-tabs__nav) {
  flex-wrap: wrap;
}

:deep(.notifications-tabs .el-tabs__item) {
  padding: 0 16px;
  font-size: 0.9rem;
}

/* Мобильные устройства */
@media (max-width: 768px) {
  .notifications {
    padding: 0 8px;
  }
  
  .notifications-header h2 {
    font-size: 1.2rem;
  }
  
  .btn-text {
    display: none;
  }
  
  .btn-icon {
    display: inline-block;
  }
  
  .mark-all-btn {
    padding: 8px 12px;
  }
  
  :deep(.notifications-tabs .el-tabs__nav) {
    justify-content: center;
  }
  
  :deep(.notifications-tabs .el-tabs__item) {
    padding: 0 10px;
    font-size: 0.8rem;
    flex: 1;
    text-align: center;
    min-width: auto;
  }
  
  :deep(.notifications-tabs .el-tabs__header) {
    margin-bottom: 16px;
  }
  
  .loading-container {
    padding: 30px 0;
  }
  
  .loading-spinner {
    font-size: 36px;
  }
}

/* Очень маленькие экраны */
@media (max-width: 320px) {
  .notifications {
    padding: 0 4px;
  }
  
  :deep(.notifications-tabs .el-tabs__item) {
    padding: 0 6px;
    font-size: 0.75rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>