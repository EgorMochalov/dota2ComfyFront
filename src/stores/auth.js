import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { safeLocalStorage } from '../utils/errorHandler'
import { ElMessage } from 'element-plus'
import { authUtils } from '../utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(safeLocalStorage.getItem('user'))
  const token = ref(safeLocalStorage.getItem('authToken'))
  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token: authToken, user: userData } = response.data
      
      token.value = authToken
      user.value = userData
      
      authUtils.setAuthData(authToken, userData)
      
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
      authUtils.clearAuthData()
      ElMessage.success('Вы вышли из системы')
    }
  }

  const getCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const response = await authAPI.getMe()
      user.value = response.data
      safeLocalStorage.setItem('user', response.data)
      return response.data
    } catch (error) {
      console.error('Get current user error:', error)
      logout()
      return null
    }
  }

  const updateUser = (userData) => {
    user.value = userData
    if (token.value) {
      authUtils.setAuthData(token.value, userData)
    }
  }

    // Инициализация при создании store
  const initialize = () => {
    token.value = authUtils.getToken()
  }

  // Вызываем инициализацию при создании store
  initialize()

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