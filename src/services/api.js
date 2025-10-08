import axios from 'axios'

// Динамическое определение базового URL
const getBaseURL = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app/api'
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
}

const API_BASE_URL = getBaseURL()

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true // Важно для CORS
})

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      // Используем window.location для надежного редиректа
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Экспортируем API методы
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh-token'),
  logout: () => api.post('/auth/logout')
}

export const usersAPI = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateSearchStatus: (data) => api.put('/users/search-status', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  search: (params) => api.get('/users/search', { params }),
  blockUser: (userId) => api.post(`/users/block/${userId}`),
  unblockUser: (userId) => api.post(`/users/unblock/${userId}`),
  getBlockedList: () => api.get('/users/blocked-list')
}

export const teamsAPI = {
  create: (data) => api.post('/teams', data),
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => api.put(`/teams/${teamId}`, data),
  deleteTeam: (teamId) => api.delete(`/teams/${teamId}`),
  updateSearchStatus: (teamId, data) => api.put(`/teams/${teamId}/search-status`, data),
  updateScrimStatus: (teamId, data) => api.put(`/teams/${teamId}/scrim-status`, data),
  uploadAvatar: (teamId, formData) => api.post(`/teams/${teamId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  leaveTeam: (teamId) => api.post(`/teams/${teamId}/leave`),
  removeMember: (teamId, userId) => api.delete(`/teams/${teamId}/members/${userId}`),
  transferCaptain: (teamId, data) => api.put(`/teams/${teamId}/transfer-captain`, data),
  getMyTeams: () => api.get('/teams/my-teams'),
  search: (params) => api.get('/teams/search', { params }),
  searchScrims: (params) => api.get('/teams/scrims', { params })
}

export const applicationsAPI = {
  applyToTeam: (teamId, data) => api.post(`/applications/team/${teamId}`, data),
  getTeamApplications: (teamId) => api.get(`/applications/team/${teamId}`),
  updateApplication: (applicationId, data) => api.put(`/applications/${applicationId}`, data),
  getMyApplications: () => api.get('/applications/my')
}

export const invitationsAPI = {
  inviteUser: (userId, data) => api.post(`/invitations/user/${userId}`, data),
  getMyInvitations: () => api.get('/invitations/my'),
  updateInvitation: (invitationId, data) => api.put(`/invitations/${invitationId}`, data)
}

export const chatAPI = {
  getRooms: () => api.get('/chat/rooms'),
  getPrivateRoom: (otherUserId) => api.post(`/chat/rooms/private/${otherUserId}`),
  getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, data) => api.post(`/chat/rooms/${roomId}/messages`, data),
  deleteRoom: (roomId) => api.delete(`/chat/rooms/${roomId}`),
  markAsRead: (roomId) => api.put(`/chat/rooms/${roomId}/read`)
}

export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
}

export default api