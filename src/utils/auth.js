import Cookies from 'js-cookie'

// Ключи для хранения данных
const AUTH_TOKEN_KEY = 'auth_token'
const USER_DATA_KEY = 'user_data'

// Время жизни токена (7 дней)
const TOKEN_EXPIRY_DAYS = 7

export const authUtils = {
  // Сохранение токена и данных пользователя
  setAuthData(token, userData) {
    // Сохраняем в cookies
    Cookies.set(AUTH_TOKEN_KEY, token, { 
      expires: TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
    
    // Сохраняем пользователя в sessionStorage (доступно в браузере)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    }
  },

  // Получение токена
  getToken() {
    return Cookies.get(AUTH_TOKEN_KEY)
  },

  // Получение данных пользователя
  getUser() {
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem(USER_DATA_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  // Очистка данных аутентификации
  clearAuthData() {
    Cookies.remove(AUTH_TOKEN_KEY)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(USER_DATA_KEY)
    }
  },

  // Проверка аутентификации
  isAuthenticated() {
    return !!this.getToken()
  }
}