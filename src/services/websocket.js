import { io } from 'socket.io-client'

class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.eventHandlers = new Map()
  }

  // Динамическое определение URL для WebSocket
  getWebSocketURL() {
    if (import.meta.env.PROD) {
      return import.meta.env.VITE_WS_URL || 'https://your-backend-url.vercel.app'
    }
    return import.meta.env.VITE_WS_URL || 'http://localhost:5000'
  }

  connect(token, user) {
    if (this.socket) {
      this.disconnect()
    }

    const wsUrl = this.getWebSocketURL()
    
    console.log('Connecting to WebSocket:', wsUrl)
    
    this.socket = io(wsUrl, {
      auth: {
        token,
        userId: user.id,
        username: user.username
      },
      transports: ['websocket', 'polling'] // Поддержка разных транспортов
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      console.log('WebSocket connected successfully')
      this.socket.emit('subscribeToChats')
      this.socket.emit('subscribeToNotifications')
    })

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false
      console.log('WebSocket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.isConnected = false
    })

    this.setupDefaultHandlers()
  }

  setupDefaultHandlers() {
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
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  // Методы для отправки событий
  joinChat(roomId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('joinChat', { roomId })
    }
  }

  leaveChat(roomId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('leaveChat', { roomId })
    }
  }

  sendTyping(roomId, isTyping) {
    if (this.isConnected && this.socket) {
      this.socket.emit('typing', { roomId, isTyping })
    }
  }

  markChatAsRead(roomId) {
    if (this.isConnected && this.socket) {
      this.socket.emit('markChatAsRead', { roomId })
    }
  }

  userActivity() {
    if (this.isConnected && this.socket) {
      this.socket.emit('userActivity')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      this.eventHandlers.clear()
    }
  }
}

export const webSocketService = new WebSocketService()