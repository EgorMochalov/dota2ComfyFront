<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <h1>Dota 2 Teammate Finder</h1>
        <p>Найдите идеальных тиммейтов для игры в Dota 2</p>
      </div>
      
      <h2>Вход в аккаунт</h2>
      
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="Email"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Пароль"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            native-type="submit"
          >
            Войти
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-links">
        <router-link to="/register">Создать аккаунт</router-link>
        <!-- <a href="#">Забыли пароль?</a> -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'

export default {
  name: 'Login',
  components: {
    Message,
    Lock
  },
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const loginFormRef = ref()
    const loading = ref(false)

    const loginForm = ref({
      email: '',
      password: ''
    })

    const loginRules = {
      email: [
        { required: true, message: 'Пожалуйста, введите email', trigger: 'blur' },
        { type: 'email', message: 'Введите корректный email', trigger: 'blur' }
      ],
      password: [
        { required: true, message: 'Пожалуйста, введите пароль', trigger: 'blur' },
        { min: 6, message: 'Пароль должен быть не менее 6 символов', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      const valid = await loginFormRef.value.validate()
      if (!valid) return

      loading.value = true
      try {
        await authStore.login(loginForm.value)
        router.push('/')
      } catch (error) {
        // Ошибка уже обработана в store
      } finally {
        loading.value = false
      }
    }

    return {
      loginFormRef,
      loading,
      loginForm,
      loginRules,
      handleLogin,
      Message,
      Lock
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
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

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.login-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.login-links a {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.login-links a:hover {
  text-decoration: underline;
}
</style>