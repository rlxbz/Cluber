import { defineStore } from 'pinia'
import { getPushListAPI, getPushDetailAPI } from '@/apis/push'

export const usePushStore = defineStore('push', {
  state: () => ({
    pushList: [],
    currentPush: null,
    total: 0,
    loading: false,
    error: '',
  }),
  actions: {
    async getPushList(params = {}) {
      this.loading = true
      this.error = ''
      try {
        const res = await getPushListAPI(params)
        const list = res?.data?.list || []
        this.pushList = list.filter(item => item && item.id)
        this.total = res?.data?.total || this.pushList.length
        return {
          list: this.pushList,
          total: this.total,
        }
      } catch (error) {
        console.error('获取推送列表失败:', error)
        this.error = error.message || '获取社团动态失败'
        this.pushList = []
        this.total = 0
        return {
          list: [],
          total: 0,
        }
      } finally {
        this.loading = false
      }
    },

    async getPushDetail(id) {
      this.loading = true
      this.error = ''
      try {
        const res = await getPushDetailAPI(id)
        this.currentPush = res?.data || null
        return this.currentPush
      } catch (error) {
        console.error('获取推送详情失败:', error)
        this.error = error.message || '获取社团动态详情失败'
        this.currentPush = null
        return null
      } finally {
        this.loading = false
      }
    },
  }
})
