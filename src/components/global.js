// Глобальная регистрация часто используемых компонентов
import { 
  ElButton, 
  ElCard, 
  ElAvatar, 
  ElTag, 
  ElDialog, 
  ElForm, 
  ElFormItem, 
  ElInput,
  ElSelect,
  ElOption,
  ElTabs,
  ElTabPane,
  ElIcon,
  ElMessage,
  ElMessageBox
} from 'element-plus'

const components = [
  ElButton,
  ElCard,
  ElAvatar,
  ElTag,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElTabs,
  ElTabPane,
  ElIcon
]

const plugins = [
  ElMessage,
  ElMessageBox
]

export const registerElementPlus = (app) => {
  components.forEach(component => {
    app.component(component.name, component)
  })
  
  plugins.forEach(plugin => {
    app.use(plugin)
  })
}