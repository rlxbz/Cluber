import { defineStore } from "pinia";
import {
  getHotActivityAPI,
  getActivityListAPI,
  getActivityDetailAPI,
  signUpActivityAPI,
  cancelSignUpAPI,
  checkSignUpStatusAPI,
  getClubActivityListAPI,
} from "@/apis/activity";
import { ElMessage } from "element-plus";

export const useActivityStore = defineStore("activity", {
  state: () => ({
    hotActivities: [],       // 热门活动列表
    activityList: [],        // 活动列表
    currentActivity: null,   // 当前活动详情
    total: 0,                // 活动总数
    isLoading: false,        // 加载状态
    error: null,             // 错误信息
    signUpStatus: {          // 报名状态
      isSigned: false,
      loading: false,
      message: "",
    },
  }),
  actions: {
    /**
     * 获取热门活动
     */
    async getHotActivity() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await getHotActivityAPI();
        const activityData = response.data;
        // 确保数据为数组格式
        const data = Array.isArray(activityData) ? activityData : [activityData];
        this.hotActivities = data;
        return data;
      } catch (error) {
        this.error = error.message || "获取热门活动失败";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 获取社团活动列表
     */
    async getClubActivityList(params) {
      try {
        const res = await getClubActivityListAPI(params);
        return res.data;
      } catch (error) {
        console.error("获取社团活动列表失败:", error);
        throw error;
      }
    },

    /**
     * 获取活动列表
     */
    async getActivityList(params) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await getActivityListAPI(params);
        this.activityList = response.list || [];
        this.total = response.total || 0;
        return response;
      } catch (error) {
        this.error = error.message || "获取活动列表失败";
        console.error("获取活动列表失败:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 获取活动详情（含报名状态）
     */
    async getActivityDetail(id) {
      this.isLoading = true;
      try {
        const res = await getActivityDetailAPI(id);
        this.currentActivity = res.data;
        // 同步检查报名状态
        await this.checkSignUpStatus(id);
        return res.data;
      } catch (error) {
        console.error("获取活动详情失败:", error);
        this.error = error.message || "获取活动详情失败";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 活动报名
     */
    async signUpActivity(activityId) {
      this.signUpStatus.loading = true;
      this.signUpStatus.message = "";

      try {
        // 先检查是否已报名
        const statusRes = await checkSignUpStatusAPI(activityId);
        if (statusRes.data.isSigned) {
          this.signUpStatus.message = "您已报名该活动，无需重复报名";
          this.signUpStatus.isSigned = true;
          ElMessage.warning(this.signUpStatus.message);
          return false;
        }

        // 执行报名
        const res = await signUpActivityAPI(activityId);
        this.signUpStatus.message = res.data.message || "报名成功";
        this.signUpStatus.isSigned = true;
        ElMessage.success(this.signUpStatus.message);

        // 重新获取活动详情更新数据
        await this.getActivityDetail(activityId);
        return true;
      } catch (error) {
        this.signUpStatus.message =
          error.response?.data?.message || "报名失败，请稍后重试";
        ElMessage.error(this.signUpStatus.message);
        return false;
      } finally {
        this.signUpStatus.loading = false;
      }
    },

    /**
     * 取消活动报名
     */
    async cancelSignUp(activityId) {
      this.signUpStatus.loading = true;
      this.signUpStatus.message = "";

      try {
        const res = await cancelSignUpAPI(activityId);
        this.signUpStatus.message = res.data.message || "取消报名成功";
        this.signUpStatus.isSigned = false;
        ElMessage.success(this.signUpStatus.message);

        // 重新获取活动详情更新数据
        await this.getActivityDetail(activityId);
        return true;
      } catch (error) {
        this.signUpStatus.message =
          error.response?.data?.message || "取消报名失败，请稍后重试";
        ElMessage.error(this.signUpStatus.message);
        return false;
      } finally {
        this.signUpStatus.loading = false;
      }
    },

    /**
     * 检查报名状态
     */
    async checkSignUpStatus(activityId) {
      try {
        const res = await checkSignUpStatusAPI(activityId);
        this.signUpStatus.isSigned = res.data.isSigned;
        return res.data.isSigned;
      } catch (error) {
        console.error("获取报名状态失败", error);
        return false;
      }
    },
  },
});