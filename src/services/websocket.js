import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.eventHandlers = new Map()
  }

  connect(token, user) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: {
        token,
        userId: user.id,
        username: user.username
      }
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected')
      this.socket.emit('subscribeToChats')
      this.socket.emit('subscribeToNotifications')
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('WebSocket disconnected')
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
    })

    this.setupDefaultHandlers()
  }

  setupDefaultHandlers() {
    // Обработчики по умолчанию
    const defaultEvents = [
      'newMessage',
      'userTyping',
      'unreadCountUpdate',
      'chatRead',
      'userOnline',
      'userOffline',
      'notification'
    ]

    defaultEvents.forEach(event => {
      this.socket.on(event, (data) => {
        this.emitEvent(event, data)
      })
    })
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event).push(handler)
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event)
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emitEvent(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        handler(data)
      })
    }
  }

  // Методы для отправки событий
  joinChat(roomId) {
    if (this.isConnected) {
      this.socket.emit('joinChat', { roomId })
    }
  }

  leaveChat(roomId) {
    if (this.isConnected) {
      this.socket.emit('leaveChat', { roomId })
    }
  }

  sendTyping(roomId, isTyping) {
    if (this.isConnected) {
      this.socket.emit('typing', { roomId, isTyping })
    }
  }

  markChatAsRead(roomId) {
    if (this.isConnected) {
      this.socket.emit('markChatAsRead', { roomId })
    }
  }

  userActivity() {
    if (this.isConnected) {
      this.socket.emit('userActivity')
    }
  }

  subscribeToNotifications() {
    if (this.isConnected) {
      this.socket.emit('subscribeToNotifications')
    }
  }

  unsubscribeFromNotifications() {
    if (this.isConnected) {
      this.socket.emit('unsubscribeFromNotifications')
    }
  }

  disconnect() {
    if (this.socket) {
      this.unsubscribeFromNotifications()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventHandlers.clear()
    }
  }
}

export const webSocketService = new WebSocketService()