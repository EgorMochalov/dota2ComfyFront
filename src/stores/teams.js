import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamsAPI } from '../services/api'
import { ElMessage } from 'element-plus'

export const useTeamsStore = defineStore('teams', () => {
  const currentTeam = ref(null)
  const myTeams = ref([])
  const searchResults = ref([])
  const scrimResults = ref([])
  const teamApplications = ref([])

  const createTeam = async (teamData) => {
    try {
      const response = await teamsAPI.create(teamData)
      currentTeam.value = response.data
      ElMessage.success('Команда создана успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка создания команды')
      throw error
    }
  }

  const updateTeam = async (teamId, teamData) => {
    try {
      const response = await teamsAPI.updateTeam(teamId, teamData)
      currentTeam.value = response.data
      ElMessage.success('Команда обновлена успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка обновления команды')
      throw error
    }
  }

  const deleteTeam = async (teamId) => {
    try {
      await teamsAPI.deleteTeam(teamId)
      currentTeam.value = null
      ElMessage.success('Команда удалена успешно!')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка удаления команды')
      throw error
    }
  }

  const getTeam = async (teamId) => {
    try {
      const response = await teamsAPI.getTeam(teamId)
      currentTeam.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки команды')
      throw error
    }
  }

  const getMyTeams = async () => {
    try {
      const response = await teamsAPI.getMyTeams()
      myTeams.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки команд')
      throw error
    }
  }

  const searchTeams = async (params) => {
    try {
      const response = await teamsAPI.search(params)
      searchResults.value = response.data.teams
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка поиска команд')
      throw error
    }
  }

  const searchScrims = async (params) => {
    try {
      const response = await teamsAPI.searchScrims(params)
      scrimResults.value = response.data.teams
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка поиска команд для кв')
      throw error
    }
  }

  const leaveTeam = async (teamId) => {
    try {
      await teamsAPI.leaveTeam(teamId)
      currentTeam.value = null
      ElMessage.success('Вы покинули команду')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка выхода из команды')
      throw error
    }
  }

  const removeMember = async (teamId, userId) => {
    try {
      await teamsAPI.removeMember(teamId, userId)
      // Обновляем локально
      if (currentTeam.value && currentTeam.value.id === teamId) {
        currentTeam.value.members = currentTeam.value.members.filter(member => member.id !== userId)
      }
      ElMessage.success('Участник удален из команды')
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка удаления участника')
      throw error
    }
  }

  const transferCaptain = async (teamId, newCaptainId) => {
    try {
      const response = await teamsAPI.transferCaptain(teamId, { newCaptainId })
      currentTeam.value = response.data
      ElMessage.success('Капитанство передано успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка передачи капитана')
      throw error
    }
  }

  const updateSearchStatus = async (teamId, status) => {
    try {
      const response = await teamsAPI.updateSearchStatus(teamId, status)
      currentTeam.value = response.data
      ElMessage.success('Статус поиска обновлен')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка обновления статуса')
      throw error
    }
  }

  const updateScrimStatus = async (teamId, status) => {
    try {
      const response = await teamsAPI.updateScrimStatus(teamId, status)
      currentTeam.value = response.data
      ElMessage.success('Статус поиска кв обновлен')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка обновления статуса кв')
      throw error
    }
  }

  const uploadTeamAvatar = async (teamId, formData) => {
    try {
      const response = await teamsAPI.uploadAvatar(teamId, formData)
      currentTeam.value = response.data
      ElMessage.success('Аватар команды обновлен успешно!')
      return response.data
    } catch (error) {
      ElMessage.error(error.response?.data?.message || 'Ошибка загрузки аватара')
      throw error
    }
  }

  const getTeamApplications = async (teamId) => {
    try {
      const response = await teamsAPI.getTeamApplications(teamId)
      teamApplications.value = response.data
      return response.data
    } catch (error) {
      ElMessage.error('Ошибка загрузки заявок команды')
      throw error
    }
  }

  return {
    currentTeam,
    myTeams,
    searchResults,
    scrimResults,
    teamApplications,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeam,
    getMyTeams,
    searchTeams,
    searchScrims,
    leaveTeam,
    removeMember,
    transferCaptain,
    updateSearchStatus,
    updateScrimStatus,
    uploadTeamAvatar,
    getTeamApplications
  }
})