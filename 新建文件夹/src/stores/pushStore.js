import { defineStore } from 'pinia'
import { getPushListAPI } from '@/apis/push'

export const usePushStore = defineStore('push', {
  state: () => ({
    pushList: [] // 推送列表数据
  }),
  actions: {
    async getPushList(params = {}) {
      try {
        const res = await getPushListAPI(params)
        // 确保返回的数据结构正确
        const list = res?.data?.list || []
        this.pushList = list.filter(item => item && item.id) // 过滤无效数据
        return this.pushList
      } catch (error) {
        console.error('获取推送列表失败:', error)
        this.pushList = []
        return []
      }
    }
  }
})