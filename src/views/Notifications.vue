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
            >
              Отметить все как прочитанные
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="Все уведомления" name="all">
          <NotificationsList
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
        await notificationsStore.getNotifications()
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
      markAllAsRead
    }
  }
}
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>