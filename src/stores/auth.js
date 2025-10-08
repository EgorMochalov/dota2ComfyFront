import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken'))
  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      
      localStorage.setItem('authToken', authToken)
      localStorage.setItem('user', JSON.stringify(userData))
      
      ElMessage.success('Успешный вход!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка входа')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      ElMessage.success('Регистрация успешна!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка регистрации')
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      ElMessage.success('Вы вышли из системы')
    }
  }

  const getCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const response = await authAPI.getMe()
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      logout()
      return null
    }
  }

  const updateUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // Инициализация при загрузке
  const storedUser = localStorage.getItem('user')
  if (storedUser && token.value) {
    user.value = JSON.parse(storedUser)
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    updateUser
  }
})