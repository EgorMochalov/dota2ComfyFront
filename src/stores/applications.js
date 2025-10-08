import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applicationsAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useApplicationsStore = defineStore('applications', () => {
  const myApplications = ref([])
  const teamApplications = ref([])

  const applyToTeam = async (teamId, data) => {
    try {
      const response = await applicationsAPI.applyToTeam(teamId, data)
      myApplications.value.push(response.data)
      ElMessage.success('Заявка отправлена успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка отправки заявки')
      throw error
    }
  }

  const getTeamApplications = async (teamId) => {
    try {
      const response = await applicationsAPI.getTeamApplications(teamId)
      teamApplications.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки заявок')
      throw error
    }
  }

  const updateApplication = async (applicationId, data) => {
    try {
      const response = await applicationsAPI.updateApplication(applicationId, data)
      // Удаляем из списка заявок команды
      teamApplications.value = teamApplications.value.filter(app => app.id !== applicationId)
      // Обновляем в моих заявках если нужно
      const myAppIndex = myApplications.value.findIndex(app => app.id === applicationId)
      if (myAppIndex !== -1) {
        myApplications.value[myAppIndex] = response.data
      }
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка обновления заявки')
      throw error
    }
  }

  const getMyApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplications()
      myApplications.value = response.data.applications
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки заявок')
      throw error
    }
  }

  return {
    myApplications,
    teamApplications,
    applyToTeam,
    getTeamApplications,
    updateApplication,
    getMyApplications
  }
})