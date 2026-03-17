import { defineStore } from "pinia";
import {
  applyJoinClubAPI,
  applyCreateClubAPI,
  getUserApplyListAPI,
  getClubJoinApplyAPI,
  handleClubJoinApplyAPI,
  applyActivityAPI,
  handleActivityApplyAPI,
  getActivityApplyListAPI,
} from "@/apis/apply.js";
import { useActivityStore } from "./activityStore";

export const useApplyStore = defineStore("apply", {
  state: () => ({
    applyList: [],
    currentApply: null,
    loading: false,
    error: null,
  }),

  actions: {
    async applyJoinClub(data) {
      this.loading = true;
      this.error = null;

      try {
        const res = await applyJoinClubAPI(data);
        return res.data;
      } catch (error) {
        this.error = error.message || "提交入社申请失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async applyCreateClub(data) {
      this.loading = true;
      this.error = null;

      try {
        const res = await applyCreateClubAPI(data);
        return res.data;
      } catch (error) {
        this.error = error.message || "提交创建社团申请失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async applyActivity(data) {
      this.loading = true;
      this.error = null;

      try {
        const res = await applyActivityAPI(data);
        return res.data;
      } catch (error) {
        this.error = error.message || "提交活动申请失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getUserApplyList(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const res = await getUserApplyListAPI(params);
        this.applyList = res.data?.list || [];
        return res.data || { list: [], total: 0 };
      } catch (error) {
        this.error = error.message || "获取我的申请记录失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getClubJoinApplications(clubId, params = {}) {
      if (!clubId) {
        throw new Error("社团ID不能为空");
      }

      this.loading = true;
      this.error = null;

      try {
        const res = await getClubJoinApplyAPI(clubId, params);
        this.applyList = res.data?.list || [];
        return res.data || { list: [], total: 0 };
      } catch (error) {
        this.error = error.message || "获取本社团入社申请失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async getActivityApplications(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const res = await getActivityApplyListAPI(params);
        this.applyList = res.data?.list || [];
        return res.data || { list: [], total: 0 };
      } catch (error) {
        this.error = error.message || "获取活动申请列表失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async handleApplication(id, data) {
      if (!id || !data?.type || !["approved", "rejected"].includes(data.status)) {
        throw new Error("参数错误：需提供申请ID、申请类型和处理状态");
      }

      this.loading = true;
      this.error = null;

      try {
        let res;

        if (data.type === "join") {
          res = await handleClubJoinApplyAPI(id, data);
        } else if (data.type === "activity") {
          res = await handleActivityApplyAPI(id, data);
        } else {
          throw new Error("不支持的申请类型");
        }

        const applyIndex = this.applyList.findIndex((item) => item.id === id);
        if (applyIndex !== -1) {
          this.applyList[applyIndex] = {
            ...this.applyList[applyIndex],
            ...(res.data || {}),
            status: data.status,
          };
        }

        if (data.type === "activity" && data.status === "approved") {
          const activityStore = useActivityStore();
          await activityStore.getActivityList();
        }

        return res.data;
      } catch (error) {
        this.error = error.message || "处理申请失败";
        console.error(this.error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async handleClubJoinApplication(id, status) {
      return this.handleApplication(id, { type: "join", status });
    },

    async handleActivityApplication(id, status) {
      return this.handleApplication(id, { type: "activity", status });
    },
  },
});
