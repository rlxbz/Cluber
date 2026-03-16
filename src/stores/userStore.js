import { defineStore } from 'pinia'
import { loginAPI, getUserInfoAPI, updateUserInfoAPI } from '@/apis/user'
import { ElMessage } from 'element-plus'
import { Storage, StorageConfig } from '@/utils/storage'

// 确定用户相关数据的存储方式
const userStorage = Storage[StorageConfig.user.token];

// 模拟的本地用户数据
// 前台主角色以 student / club_admin 为主，system_admin 仅保留为兼容测试账号。
const mockUsers = [
  {
    username: 'student',
    password: '123456',
    role: 'student',
    userInfo: { id: 1, name: '学生用户', role: 'student', avatar: '' }
  },
  {
    username: 'clubadmin',
    password: '123456',
    role: 'club_admin',
    userInfo: { id: 2, name: '社团管理员', role: 'club_admin', avatar: '' }
  },
  {
    username: 'sysadmin',
    password: '123456',
    role: 'system_admin',
    userInfo: { id: 3, name: '系统测试账号', role: 'system_admin', avatar: '' }
  }
]

export const useUserStore = defineStore('user', {
  state: () => ({
    token: userStorage.get('token') || '',
    userInfo: userStorage.get('userInfo') || null,
    role: userStorage.get('role') || '' // 前台主角色：student / club_admin；system_admin 仅保留兼容
  }),
  getters: {
    // 判断是否已登录
    isLogin() {
      return !!this.token
    }
  },
  actions: {
    // 登录（支持本地模拟登录）
    async login(userData) {
      // 本地模拟登录逻辑（优先使用，注释掉真实接口调用）
      const mockUser = mockUsers.find(
        u => u.username === userData.username && u.password === userData.password
      )
      
      if (mockUser) {
        // 模拟生成token（实际项目中由后端返回）
        this.token = `mock_token_${mockUser.role}`
        userStorage.set('token', this.token)
        
        // 直接设置用户信息（无需调用getUserInfoAPI）
        this.userInfo = mockUser.userInfo
        this.role = mockUser.role
        
        // 存储用户信息到指定存储方式
        userStorage.set('userInfo', this.userInfo)
        userStorage.set('role', this.role)
        
        ElMessage.success('登录成功（本地模拟）')
        return { success: true }
      } else {
        ElMessage.error('用户名或密码错误（本地模拟）')
        return { success: false }
      }

      // 真实接口调用（暂时注释）
      // try {
      //   const res = await loginAPI(userData)
      //   this.token = res.data.token
      //   userStorage.set('token', this.token)
      //   await this.getUserInfo()
      //   ElMessage.success('登录成功')
      //   return { success: true }
      // } catch (error) {
      //   ElMessage.error('登录失败')
      //   return { success: false }
      // }
    },
    
    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      this.role = ''
      
      // 清除存储的用户信息
      userStorage.remove('token')
      userStorage.remove('userInfo')
      userStorage.remove('role')
      
      // ElMessage.success('已退出登录')
    },
    
    // 获取用户信息（本地模拟场景下无需调用接口）
    async getUserInfo() {
      if (this.userInfo) {
        return this.userInfo
      }

      try {
        const res = await getUserInfoAPI()
        const info = res?.data || res || {}
        this.userInfo = info
        this.role = info?.role || this.role
        userStorage.set('userInfo', this.userInfo)
        userStorage.set('role', this.role)
        return this.userInfo
      } catch (error) {
        ElMessage.error('获取用户信息失败')
        this.logout()
        throw error
      }
    },
    // 更新用户信息
    async updateUserInfo(info) {
      try {
        if (!this.token || this.token.startsWith('mock_token_')) {
          this.userInfo = { ...this.userInfo, ...info }
          userStorage.set('userInfo', this.userInfo)
          return true
        }

        const res = await updateUserInfoAPI(info)
        const updateSucceeded =
          res !== null &&
          res !== undefined &&
          res !== false &&
          res?.code !== 500 &&
          res?.success !== false
        if (updateSucceeded) {
          // 更新本地存储的用户信息
          this.userInfo = { ...this.userInfo, ...info }
          userStorage.set('userInfo', this.userInfo)
          return true
        }
        return false
      } catch (error) {
        console.error('更新用户信息失败', error)
        throw error
      }
    },
  }
})
