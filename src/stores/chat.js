import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useChatStore = defineStore('chat', () => {
  const rooms = ref([])
  const activeRoom = ref(null)
  const messages = ref([])
  const unreadCount = ref(0)

  const getRooms = async () => {
    try {
      const response = await chatAPI.getRooms()
      rooms.value = response.data.chats
      calculateUnreadCount()
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки чатов')
      throw error
    }
  }

  const deleteRoom = async (id) => {
    try {
      const response = await chatAPI.deleteRoom(id)
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка удаления чата')
      throw error
    }
  }

  const getOrCreatePrivateRoom = async (otherUserId) => {
    try {
      const response = await chatAPI.getPrivateRoom(otherUserId)
      // Проверяем, есть ли уже такая комната в списке
      const existingRoom = rooms.value.find(room => 
        room.type === 'private' && 
        room.participants?.some(p => p.id === otherUserId)
      )
      
      if (!existingRoom) {
        rooms.value.unshift(response.data)
      }
      
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка создания чата')
      throw error
    }
  }

  const getMessages = async (roomId, params = {}) => {
    try {
      const response = await chatAPI.getMessages(roomId, params)
      messages.value = response.data.messages
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки сообщений')
      throw error
    }
  }

  const sendMessage = async (roomId, messageData) => {
    try {
      const response = await chatAPI.sendMessage(roomId, messageData)
      messages.value.push(response.data.chatMessage)
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка отправки сообщения')
      throw error
    }
  }

  const markAsRead = async (roomId) => {
    try {
      await chatAPI.markAsRead(roomId)
      // Обновляем локально
      const room = rooms.value.find(r => r.id === roomId)
      if (room) {
        room.unread_count = 0
      }
      calculateUnreadCount()
    } catch (error) {
      console.error('Error marking chat as read:', error)
    }
  }

  const setActiveRoom = (roomId) => {
    activeRoom.value = roomId
  }

  const calculateUnreadCount = () => {
    unreadCount.value = rooms.value.reduce((total, room) => total + (room.unread_count || 0), 0)
  }

  const addMessage = (message) => {
    if (message.room_id === activeRoom.value) {
      messages.value.push(message)
    }
    
    // Обновляем счетчик непрочитанных
    const room = rooms.value.find(r => r.id === message.room_id)
    if (room && message.room_id !== activeRoom.value) {
      room.unread_count = (room.unread_count || 0) + 1
    }
    calculateUnreadCount()
  }

  return {
    rooms,
    activeRoom,
    messages,
    unreadCount,
    getRooms,
    getOrCreatePrivateRoom,
    getMessages,
    sendMessage,
    markAsRead,
    setActiveRoom,
    addMessage,
    calculateUnreadCount,
    deleteRoom
  }
})