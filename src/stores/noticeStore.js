import { defineStore } from 'pinia'
import { getNoticeListAPI, getNoticeDetailAPI } from '@/apis/notice'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    noticeList: [],
    currentNotice: null,
    total: 0,
    noticeLoading: false,
    error: ''
  }),
  
  actions: {
    // 获取公告列表
    async getNoticeList(params = { page: 1, size: 5 }) {
      this.noticeLoading = true;
      this.error = '';
      try {
        const res = await getNoticeListAPI(params);
        this.noticeList = res.data.list || [];
        this.total = res.data.total || 0;
        return res.data;
      } catch (error) {
        this.error = error.message || "获取公告列表失败";
        console.error("公告列表请求失败:", error);
        this.noticeList = [];
        this.total = 0;
        return null;
      } finally {
        this.noticeLoading = false;
      }
    },
    
    // 获取公告详情
    async getNoticeDetail(id) {
      this.noticeLoading = true;
      this.error = '';
      try {
        const res = await getNoticeDetailAPI(id);
        this.currentNotice = res.data;
        return res.data;
      } catch (error) {
        this.error = error.message || "获取公告详情失败";
        this.currentNotice = null;
        console.error("获取公告详情失败:", error);
        return null;
      } finally {
        this.noticeLoading = false;
      }
    },
    
    // 清空当前公告
    clearCurrentNotice() {
      this.currentNotice = null;
    }
  }
})
