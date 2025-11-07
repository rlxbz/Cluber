import router from './index'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'


router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = localStorage.getItem('token')

  // 1. 无需登录的页面（直接放行）
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  // 2. 需要登录的页面（仅拦截requiresAuth: true的路由）
  if (to.meta.requiresAuth) {
    if (!token) {
      // 未登录访问受保护路由时，提示并跳转首页（而非强制登录）
      ElMessage.warning('请先登录以使用完整功能')
      next('/home')
      return
    }

    // 已登录但未获取用户信息（刷新场景）
    if (!userStore.userInfo) {
      try {
        await userStore.getUserInfo()
      } catch (error) {
        userStore.logout()
        next('/home')
        return
      }
    }

    // 3. 权限校验（基于角色）
    if (to.meta.roles && !to.meta.roles.includes(userStore.role)) {
      ElMessage.error('无权限访问该页面')
      next('/home')
      return
    }
  }

  // 4. 所有校验通过（包括未登录访问首页）
  next()
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `Cluber - ${to.meta.title}`
  }
})

export default router