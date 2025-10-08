<template>
  <div class="notification-bell">
    <el-popover
      placement="bottom"
      :width="400"
      trigger="click"
      v-model:visible="popoverVisible"
    >
      <template #reference>
        <div class="bell-container" @click="handleBellClick">
          <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
            <el-button type="text" class="bell-button">
              <el-icon :size="20"><Bell /></el-icon>
            </el-button>
          </el-badge>
        </div>
      </template>

      <div class="notifications-popover">
        <div class="popover-header">
          <h4>Уведомления</h4>
          <div class="header-actions">
            <el-button
              v-if="unreadCount > 0"
              type="text"
              size="small"
              @click="markAllAsRead"
              :loading="markingAllAsRead"
            >
              Прочитать все
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="$router.push('/notifications')"
            >
              Все уведомления
            </el-button>
          </div>
        </div>

        <div class="notifications-list">
          <div
            v-for="notification in recentNotifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <el-icon :size="16" :color="getNotificationColor(notification.type)">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
            </div>

            <div class="notification-status" v-if="!notification.is_read">
              <div class="unread-dot"></div>
            </div>
          </div>

          <div v-if="recentNotifications.length === 0" class="empty-notifications">
            <el-empty description="Нет уведомлений" :image-size="60" />
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore } from '../../stores/notifications'
import { webSocketService } from '../../services/websocket'
import { Bell, Message, User, Star, InfoFilled, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'NotificationBell',
  components: {
    Bell
  },
  setup() {
    const router = useRouter()
    const notificationsStore = useNotificationsStore()

    const popoverVisible = ref(false)
    const markingAllAsRead = ref(false)
    const loading = ref(false)

    const unreadCount = computed(() => notificationsStore.unreadCount)
    
    const recentNotifications = computed(() => {
      return notificationsStore.notifications.slice(0, 5) // Показываем последние 5 уведомлений
    })

    const getNotificationIcon = (type) => {
      const icons = {
        'info': InfoFilled,
        'message': Message,
        'user': User,
        'team': Star,
        'application': Check,
        'invitation': Check
      }
      return icons[type] || Bell
    }

    const getNotificationColor = (type) => {
      const colors = {
        'info': '#3498db',
        'message': '#27ae60',
        'user': '#e74c3c',
        'team': '#f39c12',
        'application': '#9b59b6',
        'invitation': '#2ecc71'
      }
      return colors[type] || '#95a5a6'
    }

    const formatTime = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date

      if (diff < 60 * 1000) {
        return 'только что'
      } else if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000))
        return `${minutes} мин. назад`
      } else if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000))
        return `${hours} ч. назад`
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit'
        })
      }
    }

    const handleBellClick = async () => {
      if (!popoverVisible.value) {
        // Загружаем уведомления при открытии popover
        loading.value = true
        try {
          await notificationsStore.getNotifications({ limit: 5 })
        } catch (error) {
          console.error('Error loading notifications:', error)
        } finally {
          loading.value = false
        }
      }
    }

    const handleNotificationClick = async (notification) => {
      // Отмечаем уведомление как прочитанное
      if (!notification.is_read) {
        try {
          await notificationsStore.markAsRead(notification.id)
        } catch (error) {
          console.error('Error marking notification as read:', error)
        }
      }

      // Закрываем popover
      popoverVisible.value = false

      // Обрабатываем действие в зависимости от типа уведомления
      handleNotificationAction(notification)
    }

    const handleNotificationAction = (notification) => {
      switch (notification.type) {
        case 'message':
          router.push('/chat')
          break
        case 'application':
          router.push('/applications')
          break
        case 'invitation':
          router.push('/invitations')
          break
        case 'team':
          if (notification.related_id) {
            router.push(`/teams/${notification.related_id}`)
          }
          break
        case 'user':
          if (notification.related_id) {
            router.push(`/users/${notification.related_id}`)
          }
          break
        default:
          // Для info уведомлений просто закрываем popover
          break
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

    // WebSocket обработчик для новых уведомлений
    const handleNewNotification = (notification) => {
      notificationsStore.addNotification(notification)
      
      // Показываем тост для новых уведомлений, если popover не открыт
      if (!popoverVisible.value) {
        ElMessage.info({
          message: `${notification.title}: ${notification.message}`,
          duration: 3000,
          showClose: true,
          onClick: () => {
            handleNotificationClick(notification)
          }
        })
      }
    }

    onMounted(() => {
      // Загружаем начальные уведомления
      notificationsStore.getNotifications({ limit: 5 })
      
      // Подписываемся на WebSocket события
      webSocketService.on('notification', handleNewNotification)
    })

    onUnmounted(() => {
      // Отписываемся от WebSocket событий
      webSocketService.off('notification', handleNewNotification)
    })

    return {
      popoverVisible,
      markingAllAsRead,
      unreadCount,
      recentNotifications,
      getNotificationIcon,
      getNotificationColor,
      formatTime,
      handleBellClick,
      handleNotificationClick,
      markAllAsRead
    }
  }
}
</script>

<style scoped>
.notification-bell {
  margin-right: 10px;
}

.bell-container {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-button {
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.bell-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

:deep(.el-badge__content) {
  border: 2px solid #2c3e50;
}

.notifications-popover {
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.popover-header h4 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 5px;
}

.notifications-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item.unread:hover {
  background-color: #e6f3ff;
}

.notification-icon {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 4px;
  line-height: 1.2;
}

.notification-message {
  color: #5a6c7d;
  font-size: 0.8rem;
  line-height: 1.3;
  margin-bottom: 4px;
  word-wrap: break-word;
}

.notification-time {
  color: #95a5a6;
  font-size: 0.7rem;
}

.notification-status {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: #3498db;
  border-radius: 50%;
  margin-top: 4px;
}

.empty-notifications {
  padding: 20px 0;
  text-align: center;
}

/* Стили для скроллбара */
.notifications-list::-webkit-scrollbar {
  width: 4px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>