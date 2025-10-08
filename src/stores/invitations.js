import { defineStore } from 'pinia'
import { ref } from 'vue'
import { invitationsAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useInvitationsStore = defineStore('invitations', () => {
  const myInvitations = ref([])

  const inviteUser = async (userId, data) => {
    try {
      const response = await invitationsAPI.inviteUser(userId, data)
      ElMessage.success('Приглашение отправлено успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка отправки приглашения')
      throw error
    }
  }

  const getMyInvitations = async () => {
    try {
      const response = await invitationsAPI.getMyInvitations()
      myInvitations.value = response.data.invitations
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки приглашений')
      throw error
    }
  }

  const updateInvitation = async (invitationId, data) => {
    try {
      const response = await invitationsAPI.updateInvitation(invitationId, data)
      // Удаляем из списка
      myInvitations.value = myInvitations.value.filter(inv => inv.id !== invitationId)
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка обновления приглашения')
      throw error
    }
  }

  return {
    myInvitations,
    inviteUser,
    getMyInvitations,
    updateInvitation
  }
})