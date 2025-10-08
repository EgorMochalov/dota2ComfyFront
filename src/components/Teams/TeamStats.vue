<template>
  <div class="team-stats">
    <el-card>
      <template #header>
        <h3>Статистика команды</h3>
      </template>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ team.members?.length || 0 }}/5</div>
            <div class="stat-label">Участников</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ averageMMR }}</div>
            <div class="stat-label">Средний MMR</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Odometer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ mmrRange }}</div>
            <div class="stat-label">Диапазон MMR</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><DataLine /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ regionLabel }}</div>
            <div class="stat-label">Регион</div>
          </div>
        </div>
      </div>

      <div class="team-activity">
        <h4>Активность команды</h4>
        <div class="activity-items">
          <div class="activity-item">
            <el-tag :type="team.is_searching ? 'success' : 'info'">
              {{ team.is_searching ? 'В поиске игроков' : 'Не ищет игроков' }}
            </el-tag>
          </div>
          <div class="activity-item">
            <el-tag :type="team.looking_for_scrim ? 'warning' : 'info'">
              {{ team.looking_for_scrim ? 'Ищет команды для кв' : 'Не ищет кв' }}
            </el-tag>
          </div>
          <div class="activity-item">
            <span>Создана: {{ creationDate }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { REGIONS, ROLES } from '../../utils/constants'
import { User, TrendCharts, Odometer, DataLine } from '@element-plus/icons-vue'

export default {
  name: 'TeamStats',
  components: {
    User,
    TrendCharts,
    Odometer,
    DataLine
  },
  props: {
    team: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const getRegionLabel = (regionValue) => {
      const region = REGIONS.find(r => r.value === regionValue)
      return region ? region.label : regionValue
    }

    const averageMMR = computed(() => {
      const membersWithMMR = props.team.members?.filter(member => member.mmr_rating) || []
      if (membersWithMMR.length === 0) return 'Нет данных'
      
      const totalMMR = membersWithMMR.reduce((sum, member) => sum + member.mmr_rating, 0)
      return Math.round(totalMMR / membersWithMMR.length)
    })

    const mmrRange = computed(() => {
      if (!props.team.mmr_range_min && !props.team.mmr_range_max) {
        return 'Не указан'
      }
      return `${props.team.mmr_range_min || '?'} - ${props.team.mmr_range_max || '?'}`
    })

    const regionLabel = computed(() => {
      return getRegionLabel(props.team.region)
    })

    const rolesDistribution = computed(() => {
      const roleCounts = {}
      const totalMembers = props.team.members?.length || 0
      
      // Инициализируем счетчики для всех ролей
      ROLES.forEach(role => {
        roleCounts[role.value] = 0
      })

      // Считаем количество игроков по ролям
      props.team.members?.forEach(member => {
        member.preferred_roles?.forEach(role => {
          if (roleCounts[role] !== undefined) {
            roleCounts[role]++
          }
        })
      })

      // Преобразуем в массив для отображения
      return ROLES.map(role => {
        const count = roleCounts[role.value]
        const percentage = totalMembers > 0 ? (count / totalMembers) * 100 : 0
        
        // Цвета для прогресс-баров
        const colors = {
          'carry': '#e74c3c',
          'mid': '#3498db',
          'offlane': '#f39c12',
          'support': '#27ae60',
          'hard_support': '#9b59b6'
        }

        return {
          name: role.value,
          label: role.label,
          count: count,
          percentage: percentage,
          color: colors[role.value] || '#3498db'
        }
      }).filter(role => role.count > 0)
    })

    const creationDate = computed(() => {
      if (!props.team.createdAt) return 'Неизвестно'
      return new Date(props.team.createdAt).toLocaleDateString('ru-RU')
    })

    return {
      averageMMR,
      mmrRange,
      regionLabel,
      rolesDistribution,
      creationDate
    }
  }
}
</script>

<style scoped>
.team-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #3498db;
  border-radius: 8px;
  color: white;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detailed-stats {
  margin-bottom: 30px;
}

.detailed-stats h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.roles-distribution {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.role-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-name {
  font-weight: 500;
  color: #2c3e50;
}

.role-count {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.team-activity h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.activity-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>