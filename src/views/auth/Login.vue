<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-section">
        <h1 class="gradient-text">Dota 2 Teammate Finder</h1>
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
            class="custom-input"
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
            class="custom-input"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="auth-button"
            :loading="loading"
            native-type="submit"
          >
            Войти
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-links">
        <router-link to="/register" class="auth-link">Создать аккаунт</router-link>
        <!-- <a href="#" class="auth-link">Забыли пароль?</a> -->
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background: var(--primary-gradient);
  position: relative;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.login-card {
  background: var(--bg-card);
  padding: 40px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 450px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-section {
  margin-bottom: 30px;
}

.logo-section h1 {
  color: var(--text-primary);
  margin-bottom: 10px;
  font-size: 2rem;
  font-weight: 700;
}

.logo-section p {
  color: var(--text-muted);
  margin: 0;
  font-size: 1rem;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 600;
}

.login-links {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.auth-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.auth-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

.auth-button {
  width: 100%;
  margin-top: 10px;
}

:deep(.custom-input .el-input__inner) {
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

:deep(.custom-input .el-input__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .logo-section h1 {
    font-size: 1.75rem;
  }
}
</style>