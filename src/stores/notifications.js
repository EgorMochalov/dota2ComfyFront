import { defineStore } from 'pinia'
import { ref } from 'vue'
import { notificationsAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)

  const getNotifications = async (params = {}) => {
    try {
      const response = await notificationsAPI.getNotifications(params)
      notifications.value = response.data.notifications
      calculateUnreadCount()
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки уведомлений')
      throw error
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      // Обновляем локально
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
      }
      calculateUnreadCount()
    } catch (error) {
      ElMessage.error('Ошибка отметки уведомления как прочитанного')
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      notifications.value.forEach(n => n.is_read = true)
      unreadCount.value = 0
    } catch (error) {
      ElMessage.error('Ошибка отметки всех уведомлений как прочитанных')
      throw error
    }
  }

  const getUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount()
      unreadCount.value = response.data.count
      return response.data.count
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  const calculateUnreadCount = () => {
    unreadCount.value = notifications.value.filter(n => !n.is_read).length
  }

  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    if (!notification.is_read) {
      unreadCount.value++
    }
  }

  const removeNotification = (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.is_read) {
      unreadCount.value--
    }
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  }

  // Инициализация при создании store
  const initialize = async () => {
    try {
      await getUnreadCount()
      await getNotifications({ limit: 5 })
    } catch (error) {
      console.error('Error initializing notifications:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    addNotification,
    removeNotification,
    calculateUnreadCount,
    initialize
  }
})