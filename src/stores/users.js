import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useUsersStore = defineStore('users', () => {
  const currentUserProfile = ref(null)
  const searchResults = ref([])
  const blockedUsers = ref([])

  const getProfile = async (userId) => {
    try {
      const response = await usersAPI.getProfile(userId)
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки профиля')
      throw error
    }
  }

  const updateProfile = async (data) => {
    try {
      const response = await usersAPI.updateProfile(data)
      currentUserProfile.value = response.data
      ElMessage.success('Профиль обновлен успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка обновления профиля')
      throw error
    }
  }

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await usersAPI.uploadAvatar(formData)
      currentUserProfile.value = response.data
      ElMessage.success('Аватар обновлен успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки аватара')
      throw error
    }
  }

  const searchUsers = async (params) => {
    try {
      const response = await usersAPI.search(params)
      searchResults.value = response.data.users
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка поиска игроков')
      throw error
    }
  }

  const blockUser = async (userId) => {
    try {
      await usersAPI.blockUser(userId)
      ElMessage.success('Пользователь заблокирован')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка блокировки пользователя')
      throw error
    }
  }

  const unblockUser = async (userId) => {
    try {
      await usersAPI.unblockUser(userId)
      ElMessage.success('Пользователь разблокирован')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка разблокировки пользователя')
      throw error
    }
  }

  const getBlockedList = async () => {
    try {
      const response = await usersAPI.getBlockedList()
      blockedUsers.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки списка блокировок')
      throw error
    }
  }

  return {
    currentUserProfile,
    searchResults,
    blockedUsers,
    getProfile,
    updateProfile,
    uploadAvatar,
    searchUsers,
    blockUser,
    unblockUser,
    getBlockedList
  }
})