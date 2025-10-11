<template>
  <div class="chat-container">
    <!-- Сайдбар с чатами -->
    <div class="chat-sidebar" :class="{ 'sidebar-collapsed': !isSidebarVisible }">
      <div class="sidebar-header">
        <div class="header-content" v-show="isSidebarVisible">
          <h3>Чаты</h3>
          <button @click="()=>toggleSidebar(false)" class="toggle-sidebar-btn">
            <svg class="toggle-icon" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div v-show="isSidebarVisible" class="search-container">
          <el-input
            placeholder="Поиск чатов..."
            prefix-icon="Search"
            class="search-input"
          />
        </div>
      </div>
      
      <div v-show="isSidebarVisible" class="chats-list">
        <!-- Лоадинг для списка чатов -->
        <div v-if="loadingRooms" class="loading-rooms">
          <div class="loading-spinner">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
          </div>
          <span>Загрузка чатов...</span>
        </div>
        
        <div v-else-if="chatStore.rooms.length === 0" class="empty-rooms">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>Нет чатов</span>
          <p>Начните новый диалог</p>
        </div>
        
        <div v-else>
          <div
            v-for="room in chatStore.rooms"
            :key="room.id"
            class="chat-item"
            :class="{ 
              active: activeRoom?.id === room.id,
              unread: room.unread_count > 0
            }"
            @click="selectRoom(room)"
          >
            <div class="chat-item-content">
              <div class="avatar-container">
                <el-avatar 
                  :size="mobile ? 40 : 52" 
                  :src="getRoomAvatar(room)" 
                  class="chat-avatar"
                  :class="{ 'online-indicator': getRoomParticipant(room)?.is_online }"
                />
                <div v-if="room.unread_count > 0" class="unread-indicator">
                  {{ room.unread_count > 99 ? '99+' : room.unread_count }}
                </div>
              </div>
              
              <div class="chat-details">
                <div class="chat-meta">
                  <div class="chat-name-time">
                    <span class="chat-name">{{ getRoomName(room) }}</span>
                    <span class="chat-time">{{ formatTime(room.last_message?.createdAt) }}</span>
                  </div>
                  <div class="chat-preview">
                    <div class="last-message-container">
                      <span class="last-message">{{ getLastMessage(room) }}</span>
                      <div class="message-status">
                        <i v-if="room.unread_count > 0" 
                           class="icon-unread"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="active-indicator"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Основная область чата -->
    <div class="chat-main" :class="{ 'main-expanded': !isSidebarVisible }" v-if="activeRoom">
      <div class="chat-header">
        <div class="header-info">
          <!-- Кнопка показа сайдбара когда он скрыт -->
          <button v-if="!isSidebarVisible" @click="()=>toggleSidebar(true)" class="show-sidebar-btn">
            <svg class="toggle-icon" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <el-avatar :size="mobile ? 36 : 44" :src="getRoomAvatar(activeRoom)" />
          <div class="room-info">
            <h4>{{ getRoomName(activeRoom) }}</h4>
            <p v-if="activeRoom.type === 'private'" class="online-status">
              <span class="status-dot" :class="{ online: getRoomParticipant(activeRoom)?.is_online }"></span>
              {{ getRoomParticipant(activeRoom)?.is_online ? 'Online' : 'Offline' }}
            </p>
          </div>
        </div>
        <div class="header-actions">
          <!-- Меню действий для приватных чатов -->
          <el-dropdown 
            v-if="activeRoom.type === 'private'" 
            trigger="click" 
            class="chat-actions-dropdown"
            @command="handleActionCommand"
          >
            <button class="menu-btn">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none">
                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor"/>
                <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor"/>
                <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor"/>
              </svg>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  command="delete" 
                  :disabled="deletingRoom"
                  class="dropdown-item delete"
                >
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-if="deletingRoom">Удаление...</span>
                  <span v-else>Удалить чат</span>
                </el-dropdown-item>
                
                <el-dropdown-item 
                  v-if="!getRoomParticipant(activeRoom)?.is_blocked"
                  command="block" 
                  :disabled="blockingUser"
                  class="dropdown-item block"
                >
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 5L19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span v-if="blockingUser">Блокировка...</span>
                  <span v-else>Заблокировать</span>
                </el-dropdown-item>
                
                <el-dropdown-item 
                  v-else
                  command="unblock" 
                  :disabled="unblockingUser"
                  class="dropdown-item unblock"
                >
                  <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-if="unblockingUser">Разблокировка...</span>
                  <span v-else>Разблокировать</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button type="primary" text @click="showRoomInfo = true" class="info-btn">
            <svg class="icon-info" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </el-button>
        </div>
      </div>

      <!-- Область сообщений -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="loadingMessages" class="loading-messages">
          <div class="loading-spinner large">
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
            <div class="spinner-dot"></div>
          </div>
          <span>Загрузка сообщений...</span>
        </div>
        
        <div v-else-if="chatStore.messages.length === 0" class="empty-messages">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>Нет сообщений</span>
          <p>Начните диалог первым сообщением</p>
        </div>
        
        <div v-else class="messages-list">
          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            class="message"
            :class="{ own: message.user_id === authStore.user?.id }"
          >
            <div class="message-avatar">
              <el-avatar :size="mobile ? 32 : 36" :src="message.user?.avatar_url" />
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">{{ message.user?.username }}</span>
              </div>
              <div class="message-bubble">
                <div class="message-text">
                  {{ message.message }}
                </div>
                <div class="message-time">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Поле ввода -->
      <div class="chat-input">
        <div class="typing-indicator" v-if="typingUsers.length">
          <div class="typing-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {{ typingUsers.join(', ') }} печатает...
        </div>
        <div class="input-container">
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="Введите сообщение..."
            @keydown="handleTyping"
            @keyup.enter="sendMessage"
            class="message-input"
            :disabled="sendingMessage"
          />
          <button 
            @click="sendMessage" 
            :disabled="!newMessage.trim() || sendingMessage"
            class="send-button"
            :class="{ loading: sendingMessage }"
          >
            <svg v-if="!sendingMessage" class="send-icon" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="send-loader"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Заглушка при отсутствии выбранного чата -->
    <div class="no-chat" v-else>
      <div class="no-chat-content">
        <div class="no-chat-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3>Выберите чат</h3>
        <p>Выберите чат из списка чтобы начать общение</p>
      </div>
    </div>

    <!-- Диалог информации о чате -->
    <el-dialog
      v-model="showRoomInfo"
      :title="`Информация о чате: ${getRoomName(activeRoom)}`"
      width="500px"
      class="room-info-dialog"
    >
      <div v-if="activeRoom" class="room-info-content">
        <div class="room-header">
          <el-avatar :size="80" :src="getRoomAvatar(activeRoom)" class="room-avatar" />
          <h4>{{ getRoomName(activeRoom) }}</h4>
          <el-tag :type="activeRoom.type === 'team' ? 'primary' : 'success'" class="room-type-tag">
            {{ activeRoom.type === 'team' ? 'Командный чат' : 'Приватный чат' }}
          </el-tag>
        </div>

        <div v-if="activeRoom.type === 'team'" class="team-section">
          <h5>Участники команды</h5>
          <div class="members-list">
            <div
              v-for="member in activeRoom.team?.members"
              :key="member.id"
              class="member-item"
            >
              <el-avatar :size="44" :src="member.avatar_url" />
              <div class="member-info">
                <span class="member-name">{{ member.username }}</span>
                <span class="member-mmr">MMR: {{ member.mmr_rating || 'Не указан' }}</span>
              </div>
              <el-tag v-if="member.id === activeRoom.team.captain_id" type="warning" size="small">
                Капитан
              </el-tag>
            </div>
          </div>
        </div>

        <div v-else class="private-section">
          <h5>Участник чата</h5>
          <div class="participant-card">
            <el-avatar :size="70" :src="getRoomParticipant(activeRoom)?.avatar_url" />
            <div class="participant-details">
              <h4>{{ getRoomParticipant(activeRoom)?.username }}</h4>
              <div class="participant-stats">
                <div class="stat">
                  <span class="stat-label">MMR:</span>
                  <span class="stat-value">{{ getRoomParticipant(activeRoom)?.mmr_rating || 'Не указан' }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Регион:</span>
                  <span class="stat-value">{{ getRegionLabel(getRoomParticipant(activeRoom)?.region) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Статус:</span>
                  <span class="stat-value online-dot" :class="{ online: getRoomParticipant(activeRoom)?.is_online }">
                    {{ getRoomParticipant(activeRoom)?.is_online ? 'Online' : 'Offline' }}
                  </span>
                </div>
                <div class="stat">
                  <span class="stat-label">Блокировка:</span>
                  <span class="stat-value">
                    <el-tag :type="getRoomParticipant(activeRoom)?.is_blocked ? 'danger' : 'success'" size="small">
                      {{ getRoomParticipant(activeRoom)?.is_blocked ? 'Заблокирован' : 'Активен' }}
                    </el-tag>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Глобальный лоадинг для операций -->
    <div v-if="deletingRoom || blockingUser || unblockingUser" class="global-loading-overlay">
      <div class="global-loading-content">
        <div class="global-spinner">
          <div class="spinner-ring"></div>
        </div>
        <span class="global-loading-text">
          {{ deletingRoom && 'Удаление чата...' }}
          {{ blockingUser && 'Блокировка пользователя...' }}
          {{ unblockingUser && 'Разблокировка пользователя...' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useUsersStore } from '../stores/users'
import { webSocketService } from '../services/websocket'
import { REGIONS } from '../utils/constants'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'Chat',
  components: {
    Loading
  },
  setup() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const usersStore = useUsersStore()

    const activeRoom = ref(null)
    const showRoomInfo = ref(false)
    const newMessage = ref('')
    const sendingMessage = ref(false)
    const loadingMessages = ref(false)
    const loadingRooms = ref(false) // Добавлено состояние загрузки комнат
    const messagesContainer = ref(null)
    const typingUsers = ref([])
    const typingTimeout = ref(null)
    
    // Состояния для операций
    const deletingRoom = ref(false)
    const blockingUser = ref(false)
    const unblockingUser = ref(false)

    // Добавляем состояние для видимости сайдбара
    const isSidebarVisible = ref(true)

    // Определяем мобильное устройство
    const mobile = computed(() => window.innerWidth < 768)

    // Функция переключения видимости сайдбара
    const toggleSidebar = (value) => {
      isSidebarVisible.value = value
    }

    const getRoomAvatar = (room) => {
      if (room?.type === 'team') {
        return room.team?.avatar_url
      } else {
        const participant = getRoomParticipant(room)
        return participant?.avatar_url
      }
    }

    const getRoomName = (room) => {
      if (room?.type === 'team') {
        return room.team?.name || 'Командный чат'
      } else {
        const participant = getRoomParticipant(room)
        return participant?.username || 'Пользователь'
      }
    }

    const getRoomParticipant = (room) => {
      if (room?.type === 'private') {
        return room.other_user
      }
      return null
    }

    const getLastMessage = (room) => {
      if (room.last_message) {
        return room.last_message.message
      }
      return 'Нет сообщений'
    }

    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const formatTime = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diff = now - date

      if (diff < 24 * 60 * 60 * 1000) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
      }
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          requestAnimationFrame(() => {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
          });
        }
      });
    };

    const selectRoom = async (room) => {
      activeRoom.value = room
      loadingMessages.value = true

      try {
        await chatStore.getMessages(room.id)
        await chatStore.markAsRead(room.id)
        chatStore.setActiveRoom(room.id)
        webSocketService.joinChat(room.id)
        scrollToBottom()
        // На мобильных автоматически скрываем сайдбар при выборе чата
        if (mobile.value) {
          toggleSidebar(false)
        }
      } catch (error) {
        ElMessage.error('Ошибка загрузки сообщений')
      } finally {
        loadingMessages.value = false
      }
    }

    const sendMessage = async () => {
      if (!newMessage.value.trim() || !activeRoom.value) return

      sendingMessage.value = true
      try {
        await chatStore.sendMessage(activeRoom.value.id, {
          message: newMessage.value.trim(),
          message_type: 'text'
        })
        newMessage.value = ''
        scrollToBottom()
        // Отправляем событие о прекращении набора
        webSocketService.sendTyping(activeRoom.value.id, false)
      } catch (error) {
        ElMessage.error('Ошибка отправки сообщения')
      } finally {
        sendingMessage.value = false
      }
    }

    const handleTyping = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        return
      }

      if (activeRoom.value) {
        webSocketService.sendTyping(activeRoom.value.id, true)
        
        clearTimeout(typingTimeout.value)
        typingTimeout.value = setTimeout(() => {
          webSocketService.sendTyping(activeRoom.value.id, false)
        }, 3000)
      }
    }

    // Обработчик команд из выпадающего меню
    const handleActionCommand = async (command) => {
      switch (command) {
        case 'delete':
          await handleDeleteRoom()
          break
        case 'block':
          await handleBlockUser()
          break
        case 'unblock':
          await handleUnblockUser()
          break
      }
    }

    // Функции для управления приватными чатами
    const handleDeleteRoom = async () => {
      try {
        await ElMessageBox.confirm(
          'Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.',
          'Подтверждение удаления',
          {
            confirmButtonText: 'Удалить',
            cancelButtonText: 'Отмена',
            type: 'warning',
          }
        )
        
        deletingRoom.value = true
        await chatStore.deleteRoom(activeRoom.value.id)
        ElMessage.success('Чат успешно удален')
        activeRoom.value = null
        await chatStore.getRooms()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка при удалении чата')
        }
      } finally {
        deletingRoom.value = false
      }
    }

    const handleBlockUser = async () => {
      try {
        await ElMessageBox.confirm(
          `Вы уверены, что хотите заблокировать пользователя ${getRoomParticipant(activeRoom.value)?.username}?`,
          'Подтверждение блокировки',
          {
            confirmButtonText: 'Заблокировать',
            cancelButtonText: 'Отмена',
            type: 'warning',
          }
        )
        
        blockingUser.value = true
        await usersStore.blockUser(getRoomParticipant(activeRoom.value)?.id)
        ElMessage.success('Пользователь заблокирован')
        await chatStore.getRooms()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка при блокировке пользователя')
        }
      } finally {
        blockingUser.value = false
      }
    }

    const handleUnblockUser = async () => {
      try {
        await ElMessageBox.confirm(
          `Вы уверены, что хотите разблокировать пользователя ${getRoomParticipant(activeRoom.value)?.username}?`,
          'Подтверждение разблокировки',
          {
            confirmButtonText: 'Разблокировать',
            cancelButtonText: 'Отмена',
            type: 'success',
          }
        )
        
        unblockingUser.value = true
        await usersStore.unblockUser(getRoomParticipant(activeRoom.value)?.id)
        ElMessage.success('Пользователь разблокирован')
        await chatStore.getRooms()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('Ошибка при разблокировке пользователя')
        }
      } finally {
        unblockingUser.value = false
      }
    }

    // WebSocket обработчики
    const setupWebSocketHandlers = () => {
      webSocketService.on('newMessage', (data) => {
        if (data.roomId === activeRoom.value?.id && data.message.user_id != authStore.user.id) {
          chatStore.addMessage(data.message)
          scrollToBottom()
        }
      })

      webSocketService.on('userTyping', (data) => {
        if (data.roomId === activeRoom.value?.id) {
          if (data.isTyping) {
            if (!typingUsers.value.includes(data.username)) {
              typingUsers.value.push(data.username)
            }
          } else {
            typingUsers.value = typingUsers.value.filter(user => user !== data.username)
          }
        }
      })

      webSocketService.on('unreadCountUpdate', (data) => {
        chatStore.getRooms() // Перезагружаем комнаты для обновления счетчиков
      })
    }

    onMounted(async () => {
      try {
        loadingRooms.value = true
        await chatStore.getRooms()
        setupWebSocketHandlers()

        // Если есть комнаты, выбираем первую
        if (chatStore.rooms.length > 0 && !activeRoom.value) {
          await selectRoom(chatStore.rooms[0])
        }
      } catch (error) {
        ElMessage.error('Ошибка загрузки чатов')
      } finally {
        loadingRooms.value = false
      }
    })

    onUnmounted(() => {
      // Отписываемся от событий WebSocket
      webSocketService.off('newMessage')
      webSocketService.off('userTyping')
      webSocketService.off('unreadCountUpdate')
      
      if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
      }
    })

    return {
      authStore,
      chatStore,
      activeRoom,
      showRoomInfo,
      newMessage,
      sendingMessage,
      loadingMessages,
      loadingRooms, // Добавлено в возвращаемые значения
      messagesContainer,
      typingUsers,
      deletingRoom,
      blockingUser,
      unblockingUser,
      isSidebarVisible,
      mobile,
      toggleSidebar,
      getRoomAvatar,
      getRoomName,
      getRoomParticipant,
      getLastMessage,
      getRegionLabel,
      formatTime,
      selectRoom,
      sendMessage,
      handleTyping,
      handleActionCommand
    }
  }
}
</script>

<style scoped>
/* Добавляем стили для лоадинга */

/* Лоадинг для списка чатов */
.loading-rooms {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-muted);
  text-align: center;
}

.loading-rooms .loading-spinner {
  display: flex;
  flex-direction: row;
  height: auto;
  margin-bottom: 16px;
}

/* Лоадинг для сообщений */
.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-muted);
  text-align: center;
}

.loading-messages .loading-spinner.large {
  display: flex;
  flex-direction: row;
  margin-bottom: 20px;
}

.loading-messages .loading-spinner.large .spinner-dot {
  width: 10px;
  height: 10px;
}

/* Пустые состояния */
.empty-rooms,
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--text-muted);
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
  color: var(--border-color);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-rooms span,
.empty-messages span {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-rooms p,
.empty-messages p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
}

/* Глобальный лоадинг для операций */
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

/* Анимация спиннера */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Улучшенный спиннер для точек */
.loading-spinner {
  display: flex;
  gap: 4px;
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

/* Остальные существующие стили остаются без изменений */
.chat-container {
  display: flex;
  height: calc(100vh - 140px);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  position: relative;
  transition: all var(--transition-normal);
}

/* Сайдбар */
.chat-sidebar {
  width: 420px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  position: relative;
  z-index: 10;
}

.chat-sidebar.sidebar-collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 0;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px 24px;
}

.header-content h3 {
  margin: 0;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 1.5rem;
}

/* Кнопка переключения сайдбара */
.toggle-sidebar-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  margin-left: auto;
}

.toggle-sidebar-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

.search-container {
  padding: 0 24px 20px 24px;
}

.search-input :deep(.el-input__inner) {
  border-radius: 20px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  transition: all var(--transition-fast);
}

.search-input :deep(.el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.search-input :deep(.el-input__prefix) {
  left: 12px;
}

.chats-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

/* Полностью переработанный chat-item */
.chat-item {
  position: relative;
  margin-bottom: 8px;
  border-radius: var(--border-radius-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
  overflow: hidden;
}

.chat-item:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.chat-item.active {
  background: var(--primary-gradient);
  border-color: transparent;
  box-shadow: var(--shadow-lg);
}

.chat-item.unread {
  background: var(--bg-secondary);
  border-left: 4px solid var(--primary-color);
}

.chat-item.active .chat-item-content {
  color: white;
}

.chat-item-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.chat-avatar {
  border: 3px solid transparent;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.chat-item:hover .chat-avatar {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.chat-item.active .chat-avatar {
  border-color: rgba(255, 255, 255, 0.3);
}

.online-indicator::after {
  content: '';
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--success-gradient);
  border: 2px solid var(--bg-secondary);
  border-radius: 50%;
  z-index: 1;
}

.unread-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger-gradient);
  color: white;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  z-index: 3;
}

.chat-details {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.chat-meta {
  flex: 1;
  min-width: 0;
}

.chat-name-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.chat-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  margin-right: 8px;
}

.chat-item.active .chat-name {
  color: white;
}

.chat-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  flex-shrink: 0;
}

.chat-item.active .chat-time {
  color: rgba(255, 255, 255, 0.9);
}

.chat-preview {
  display: flex;
  align-items: center;
  gap: 6px;
}

.last-message-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.last-message {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.chat-item.active .last-message {
  color: rgba(255, 255, 255, 0.9);
}

.chat-item.unread .last-message {
  color: var(--text-primary);
  font-weight: 600;
}

.message-status {
  flex-shrink: 0;
}

.icon-unread {
  width: 8px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 50%;
  display: inline-block;
}

.active-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: 1;
}

.chat-item.active .active-indicator {
  opacity: 1;
}

/* Анимации для списка чатов */
.chat-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Основная область чата */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
}

.chat-main.main-expanded {
  margin-left: 0;
}

.chat-header {
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Кнопка показа сайдбара в заголовке */
.show-sidebar-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  margin-right: 12px;
}

.show-sidebar-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.room-info h4 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
  font-weight: 600;
}

.online-status {
  margin: 4px 0 0 0;
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  transition: background var(--transition-fast);
}

.status-dot.online {
  background: var(--success-gradient);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Кнопка меню с тремя точками */
.menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.menu-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: var(--primary-color);
}

.menu-icon {
  width: 20px;
  height: 20px;
}

.info-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all var(--transition-fast);
  background: none;
}

.info-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

.icon-info {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
}

/* Область сообщений */
.messages-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(120, 119, 198, 0.03) 3%, transparent 0%), 
    radial-gradient(circle at 75px 75px, rgba(120, 119, 198, 0.03) 3%, transparent 0%);
  background-size: 100px 100px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  align-self: start;
  gap: 12px;
  max-width: 75%;
  animation: messageAppear 0.3s ease-out;
}

.message.own {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.own .message-content {
  align-items: flex-end;
}

.message-avatar {
  flex-shrink: 0;
  align-self: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  flex: 1;
}

.message-sender {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.message.own .message-sender {
  display: none;
}

/* Переработанные стили для сообщений */
.message-bubble {
  position: relative;
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  max-width: 100%;
  word-wrap: break-word;
  margin-bottom: 10px;
}

.message.own .message-bubble {
  background: var(--primary-gradient);
  color: white;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 18px;
}

.message-text {
  line-height: 1.4;
  margin-right: 40px;
  margin-bottom: 2px;
}

.message-time {
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-size: 0.7rem;
  color: var(--text-muted);
  opacity: 0.8;
  white-space: nowrap;
}

.message.own .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* Анимация появления сообщения */
@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Эффекты при наведении на сообщение */
.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.message.own .message-bubble:hover {
  box-shadow: var(--shadow-lg);
}

/* Поле ввода - полностью переработано */
.chat-input {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.typing-indicator {
  font-size: 0.8rem;
  color: var(--primary-color);
  margin-bottom: 12px;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.typing-animation {
  display: flex;
  gap: 2px;
}

.typing-animation span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-animation span:nth-child(1) { animation-delay: -0.32s; }
.typing-animation span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.message-input :deep(.el-textarea__inner) {
  border-radius: 24px;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  resize: none;
  font-size: 0.9rem;
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  line-height: 1.4;
  font-family: inherit;
}

.message-input :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Новая кнопка отправки */
.send-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-gradient);
  border: none;
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.send-button:active {
  transform: translateY(0);
}

.send-button:disabled {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.send-button:hover:not(:disabled) .send-icon {
  transform: translateX(2px);
}

.send-loader {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.send-button.loading {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--primary-color);
}

/* Заглушка без чата */
.no-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.no-chat-content {
  text-align: center;
  color: var(--text-muted);
  max-width: 300px;
}

.no-chat-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: var(--border-color);
}

.no-chat-icon svg {
  width: 100%;
  height: 100%;
}

.no-chat-content h3 {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.3rem;
}

.no-chat-content p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Анимации */
.chat-sidebar {
  animation: slideInLeft 0.3s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .chat-container {
    height: calc(100vh - 120px);
  }
  
  .chat-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: var(--shadow-xl);
    width: 100%;
    max-width: 380px;
  }
  
  .chat-sidebar:not(.sidebar-collapsed) {
    transform: translateX(0);
  }
  
  .chat-sidebar.sidebar-collapsed {
    transform: translateX(-100%);
  }
  
  .chat-main.main-expanded {
    width: 100%;
  }
  
  /* Затемнение фона когда сайдбар открыт на мобильных */
  .chat-sidebar:not(.sidebar-collapsed) + .chat-main::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 5;
  }
}

/* Мобильная адаптация для очень маленьких экранов (< 500px) */
@media (max-width: 500px) {
  .chat-container {
    height: calc(100vh - 100px);
    border-radius: var(--border-radius);
  }
  
  .chat-sidebar {
    max-width: 100%;
  }
  
  .header-content {
    padding: 16px 20px 12px 20px;
  }
  
  .header-content h3 {
    font-size: 1.3rem;
  }
  
  .search-container {
    padding: 0 20px 16px 20px;
  }
  
  .chats-list {
    padding: 6px 12px;
  }
  
  .chat-item-content {
    padding: 12px;
    gap: 12px;
  }
  
  .chat-name {
    font-size: 0.9rem;
  }
  
  .last-message {
    font-size: 0.8rem;
  }
  
  .chat-time {
    font-size: 0.7rem;
  }
  
  /* Основная область чата */
  .chat-header {
    padding: 12px 16px;
  }
  
  .header-info {
    gap: 12px;
  }
  
  .room-info h4 {
    font-size: 1.1rem;
  }
  
  .online-status {
    font-size: 0.8rem;
  }
  
  .messages-container {
    padding: 16px;
  }
  
  .message {
    max-width: 85%;
    gap: 8px;
  }
  
  .message-bubble {
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  
  .message-text {
    margin-right: 35px;
    font-size: 0.9rem;
  }
  
  .message-time {
    font-size: 0.65rem;
    bottom: 4px;
    right: 10px;
  }
  
  .chat-input {
    padding: 16px;
  }
  
  .input-container {
    gap: 8px;
  }
  
  .message-input :deep(.el-textarea__inner) {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
  
  .send-button {
    width: 44px;
    height: 44px;
  }
  
  .send-icon {
    width: 18px;
    height: 18px;
  }
  
  .toggle-sidebar-btn,
  .show-sidebar-btn {
    width: 36px;
    height: 36px;
  }
  
  .menu-btn {
    width: 36px;
    height: 36px;
  }
  
  .info-btn {
    padding: 6px;
  }
  
  /* Адаптация лоадинга для мобильных */
  .loading-rooms,
  .empty-rooms {
    padding: 30px 16px;
  }
  
  .loading-messages,
  .empty-messages {
    padding: 40px 16px;
  }
  
  .global-loading-content {
    padding: 24px;
    min-width: 180px;
  }
}

/* Еще более мелкие экраны (< 360px) */
@media (max-width: 360px) {
  .chat-container {
    height: calc(100vh - 80px);
  }
  
  .header-content {
    padding: 12px 16px 10px 16px;
  }
  
  .search-container {
    padding: 0 16px 12px 16px;
  }
  
  .chats-list {
    padding: 4px 8px;
  }
  
  .chat-item-content {
    padding: 10px;
    gap: 10px;
  }
  
  .chat-header {
    padding: 10px 12px;
  }
  
  .messages-container {
    padding: 12px;
  }
  
  .message {
    max-width: 90%;
  }
  
  .message-bubble {
    padding: 8px 12px;
  }
  
  .chat-input {
    padding: 12px;
  }
}

/* Кастомный скроллбар */
.chats-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.chats-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.chats-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.chats-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Анимация для отправки сообщения */
.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>

<style>
/* Стили для диалога информации о чате */
.room-info-dialog .el-dialog {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.room-info-dialog .el-dialog__header {
  background: var(--primary-gradient);
  margin: 0;
  padding: 20px 24px;
}

.room-info-dialog .el-dialog__title {
  color: white;
  font-weight: 600;
}

.room-info-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
}

.room-info-dialog .el-dialog__body {
  padding: 0;
}

.room-info-content {
  padding: 0;
}

.room-header {
  text-align: center;
  padding: 32px 24px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.room-avatar {
  margin-bottom: 16px;
  border: 4px solid var(--bg-secondary);
  box-shadow: var(--shadow-sm);
}

.room-header h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 700;
}

.room-type-tag {
  font-weight: 600;
  padding: 6px 12px;
}

.team-section,
.private-section {
  padding: 24px;
}

.team-section h5,
.private-section h5 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.member-item:hover {
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.member-mmr {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.participant-card {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.participant-details {
  flex: 1;
}

.participant-details h4 {
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 700;
}

.participant-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat {
  display: flex;
  gap: 8px;
}

.stat-label {
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 80px;
  font-size: 0.9rem;
}

.stat-value {
  color: var(--text-primary);
  font-size: 0.9rem;
}

.online-dot {
  display: flex;
  align-items: center;
  gap: 6px;
}

.online-dot::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  transition: background var(--transition-fast);
}

.online-dot.online::before {
  background: var(--success-gradient);
}

/* Стили для выпадающего меню действий */
.chat-actions-dropdown .el-dropdown-menu {
  padding: 8px;
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
}

.dropdown-item.delete:hover {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.dropdown-item.block:hover {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.1);
}

.dropdown-item.unblock:hover {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
}

/* Адаптивность диалога для мобильных */
@media (max-width: 500px) {
  .room-info-dialog .el-dialog {
    width: 95% !important;
    margin: 10px auto;
  }
  
  .room-header {
    padding: 24px 16px;
  }
  
  .room-avatar {
    width: 60px !important;
    height: 60px !important;
  }
  
  .room-header h4 {
    font-size: 1.2rem;
  }
  
  .team-section,
  .private-section {
    padding: 16px;
  }
  
  .participant-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 16px;
  }
  
  .participant-stats {
    gap: 6px;
  }
  
  .stat {
    justify-content: center;
  }
}
</style>