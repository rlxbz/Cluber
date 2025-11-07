import { defineStore } from 'pinia'
import { getNoticeListAPI, getNoticeDetailAPI } from '@/apis/notice'
import { ElMessage } from 'element-plus'

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
      try {
        const res = await getNoticeListAPI(params);
        this.noticeList = res.data.list || [];
        this.total = res.data.total || 0;
        return res.data;
      } catch (error) {
        console.error("公告列表请求失败:", error);
        ElMessage.error("网络错误，无法获取公告");
        return null;
      } finally {
        this.noticeLoading = false;
      }
    },
    
    // 获取公告详情
    async getNoticeDetail(id) {
      this.noticeLoading = true;
      try {
        const res = await getNoticeDetailAPI(id);
        this.currentNotice = res.data;
        return res.data;
      } catch (error) {
        console.error("获取公告详情失败:", error);
        ElMessage.error("无法获取公告详情");
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