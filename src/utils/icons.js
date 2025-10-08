import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export const registerIcons = (app) => {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}

// Экспортируем все иконки для использования в компонентах
export { ElementPlusIconsVue }