// Глобальный обработчик ошибок
export const setupErrorHandling = (app) => {
  // Обработчик ошибок Vue
  app.config.errorHandler = (err, instance, info) => {
    console.error('Vue error:', err)
    console.error('Component:', instance)
    console.error('Info:', info)
    
    // Можно отправить ошибку в сервис мониторинга
    if (import.meta.env.PROD) {
      // sendErrorToMonitoringService(err)
    }
  }

  // Обработчик необработанных промисов
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    event.preventDefault()
  })

  // Обработчик глобальных ошибок
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })
}

export const safeJSONParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str)
  } catch {
    return defaultValue
  }
}

export const safeLocalStorage = {
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? safeJSONParse(item, defaultValue) : defaultValue
    } catch {
      return defaultValue
    }
  },
  
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },
  
  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}