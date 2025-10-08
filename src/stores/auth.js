import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/api'
import { safeLocalStorage } from '../utils/errorHandler'
import { ElMessage } from 'element-plus'

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
      
      safeLocalStorage.setItem('authToken', authToken)
      safeLocalStorage.setItem('user', userData)
      
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
      safeLocalStorage.removeItem('authToken')
      safeLocalStorage.removeItem('user')
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
    safeLocalStorage.setItem('user', userData)
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