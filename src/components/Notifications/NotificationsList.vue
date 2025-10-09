<template>
  <div class="notifications-list">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
      :class="{ unread: !notification.is_read }"
    >
      <div class="notification-icon">
        <el-icon :size="20" :color="getNotificationColor(notification.type)">
          <component :is="getNotificationIcon(notification.type)" />
        </el-icon>
      </div>
      
      <div class="notification-content">
        <div class="notification-header">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
        
        <p class="notification-message">{{ notification.message }}</p>
        
        <div class="notification-actions" v-if="getNotificationActions(notification)">
          <el-button
            v-for="action in getNotificationActions(notification)"
            :key="action.label"
            :type="action.type || 'primary'"
            size="small"
            @click="handleAction(notification, action)"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>

      <div class="notification-actions" v-if="!notification.is_read">
        <el-button
          type="text"
          size="small"
          @click="$emit('mark-as-read', notification.id)"
        >
          Отметить как прочитанное
        </el-button>
      </div>
    </div>

    <el-empty v-if="notifications.length === 0" description="Нет уведомлений" />
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { Bell, Message, User, Star, InfoFilled } from '@element-plus/icons-vue'

export default {
  name: 'NotificationsList',
  props: {
    notifications: {
      type: Array,
      default: () => []
    }
  },
  emits: ['mark-as-read'],
  setup(props, { emit }) {
    const router = useRouter()

    const getNotificationIcon = (type) => {
      const icons = {
        'info': InfoFilled,
        'message': Message,
        'user': User,
        'team': Star,
        'application': Bell,
        'invitation': Bell
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

    const getNotificationActions = (notification) => {
      const actions = []
      
      if (notification.type === 'application') {
        actions.push({
          label: 'Просмотреть заявки',
          handler: () => router.push('/applications')
        })
      } else if (notification.type === 'invitation') {
        actions.push({
          label: 'Просмотреть приглашения',
          handler: () => router.push('/invitations')
        })
      } else if (notification.type === 'message') {
        actions.push({
          label: 'Открыть чат',
          handler: () => router.push('/chat')
        })
      }
      
      return actions
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
          month: '2-digit',
          year: 'numeric'
        })
      }
    }

    const handleAction = (notification, action) => {
      if (action.handler) {
        action.handler(notification)
      }
    }

    return {
      getNotificationIcon,
      getNotificationColor,
      getNotificationActions,
      formatTime,
      handleAction
    }
  }
}
</script>

<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  transition: all 0.3s;
}

.notification-item.unread {
  border-left: 4px solid #3498db;
  background: #f8f9fa;
}

.notification-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.notification-icon {
  display: flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.notification-time {
  font-size: 0.8rem;
  color: #7f8c8d;
  flex-shrink: 0;
  margin-left: 15px;
}

.notification-message {
  margin: 0;
  color: #5a6c7d;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>