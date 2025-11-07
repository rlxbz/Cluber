// src/utils/http.js（补充后的完整代码）
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore' // 导入用户状态管理

const request = axios.create({
  baseURL: import.meta.env.VITE_MOCK_BASEURL,
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 Pinia 中获取用户 token
    const userStore = useUserStore()
    if (userStore.token) {
      // 为请求头添加认证信息（根据后端要求调整字段名）
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    // 处理请求发送失败的情况
    ElMessage.error('请求发送失败，请检查网络')
    return Promise.reject(error)
  }
)

// 响应拦截器（保持原逻辑）
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理申请相关的特定错误
    if (error.response && error.response.config.url.includes('/apply/')) {
      const status = error.response.status
      const data = error.response.data
      
      if (status === 400) {
        ElMessage.error(data.message || '申请参数错误，请检查信息')
      } else if (status === 403) {
        ElMessage.error('没有权限处理此申请')
      } else if (status === 409) {
        ElMessage.error('申请状态已更新，请刷新后重试')
      } else {
        ElMessage.error('处理申请失败，请稍后重试')
      }
    }
    
    return Promise.reject(error)
  }
)

export default request