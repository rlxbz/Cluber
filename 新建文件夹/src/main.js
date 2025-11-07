import { createApp } from 'vue'
import '@/assets/css/global.css'
import App from './App.vue'
import router from './router' // 导入路由
import store from './stores'  // 导入Pinia
import ElementPlus from 'element-plus' // 导入Element Plus
import 'element-plus/dist/index.css' // 导入Element Plus样式
import './router/guard'
import { useSettingStore } from './stores/settingStore'

// 导入通用组件
import CommonButton from '@/components/common/Button/index.vue'
import CommonInput from '@/components/common/Input/index.vue'
import CommonDialog from '@/components/common/Dialog/index.vue'

// 创建应用实例
const app = createApp(App)

// 注册插件
app.use(router)
app.use(store)
app.use(ElementPlus)


const settingStore = useSettingStore()
settingStore.initSettings()

// 注册全局组件
app.component('CommonButton', CommonButton)
app.component('CommonInput', CommonInput)
app.component('CommonDialog', CommonDialog)

// 挂载应用
app.mount('#app')