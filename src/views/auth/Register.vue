<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo-section">
        <h1>Dota 2 Teammate Finder</h1>
        <p>Присоединяйтесь к сообществу игроков Dota 2</p>
      </div>
      
      <h2>Создать аккаунт</h2>
      
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            placeholder="Email"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="Имя пользователя"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="Пароль"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="Подтвердите пароль"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item prop="region">
          <el-select
            v-model="registerForm.region"
            placeholder="Выберите регион"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="region in REGIONS"
              :key="region.value"
              :label="region.label"
              :value="region.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            native-type="submit"
          >
            Создать аккаунт
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="register-links">
        <router-link to="/login">Уже есть аккаунт? Войдите</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { REGIONS } from '../../utils/constants'
import { ElMessage } from 'element-plus'
import { Message, User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Register',
  components: {
    Message,
    User,
    Lock
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const registerFormRef = ref()
    const loading = ref(false)

    const registerForm = ref({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      region: ''
    })

    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== registerForm.value.password) {
        callback(new Error('Пароли не совпадают'))
      } else {
        callback()
      }
    }

    const registerRules = {
      email: [
        { required: true, message: 'Пожалуйста, введите email', trigger: 'blur' },
        { type: 'email', message: 'Введите корректный email', trigger: 'blur' }
      ],
      username: [
        { required: true, message: 'Пожалуйста, введите имя пользователя', trigger: 'blur' },
        { min: 3, message: 'Имя пользователя должно быть не менее 3 символов', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Пожалуйста, введите пароль', trigger: 'blur' },
        { min: 6, message: 'Пароль должен быть не менее 6 символов', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: 'Пожалуйста, подтвердите пароль', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
      ],
      region: [
        { required: true, message: 'Пожалуйста, выберите регион', trigger: 'change' }
      ]
    }

    const handleRegister = async () => {
      if (!registerFormRef.value) return

      const valid = await registerFormRef.value.validate()
      if (!valid) return

      loading.value = true
      try {
        await authStore.register({
          email: registerForm.value.email,
          username: registerForm.value.username,
          password: registerForm.value.password,
          region: registerForm.value.region
        })
        ElMessage.success('Регистрация успешна! Теперь вы можете войти.')
        router.push('/login')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        loading.value = false
      }
    }

    return {
      REGIONS,
      registerFormRef,
      loading,
      registerForm,
      registerRules,
      handleRegister,
      Message,
      User,
      Lock
    }
  }
}
</script>

<style scoped>
.register-container {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.logo-section {
  margin-bottom: 30px;
}

.logo-section h1 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2rem;
}

.logo-section p {
  color: #7f8c8d;
  margin: 0;
}

.register-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.register-links {
  text-align: center;
  margin-top: 20px;
}

.register-links a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.register-links a:hover {
  text-decoration: underline;
}
</style>