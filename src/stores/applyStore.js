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
  // getApplyDetailAPI  假设后续扩展详情API（若无需可删除）
} from "@/apis/apply.js";
import { useActivityStore } from "./activityStore";

export const useApplyStore = defineStore("apply", {
  state: () => ({
    applyList: [], // 申请列表（通用：个人申请/管理端申请）
    currentApply: null, // 当前查看的申请详情（扩展功能）
    loading: false, // 加载状态
    error: null // 错误信息
  }),

  actions: {
    // 申请加入社团（用户端）
    async applyJoinClub(data) {
      this.loading = true;
      this.error = null;
      try {
        const res = await applyJoinClubAPI(data);
        return res.data;
      } catch (err) {
        this.error = err.message || "申请加入社团失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 申请创建社团（用户端）
    async applyCreateClub(data) {
      this.loading = true;
      this.error = null;
      try {
        const res = await applyCreateClubAPI(data);
        return res.data;
      } catch (err) {
        this.error = err.message || "申请创建社团失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 申请举办活动（用户端）
    async applyActivity(data) { // 补充：用户端活动申请的独立封装
      this.loading = true;
      this.error = null;
      try {
        const res = await applyActivityAPI(data);
        return res.data;
      } catch (err) {
        this.error = err.message || "申请举办活动失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取个人所有申请列表（用户端）
    async getUserApplyList(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await getUserApplyListAPI(params);
        this.applyList = res.data.list;
        return res.data; // { list: 申请列表, total: 总条数 }
      } catch (err) {
        this.error = err.message || "获取个人申请列表失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },


    // 获取单个社团的加入申请列表（社团管理员端）
    async getClubJoinApply(clubId, params = {}) { // 优化：明确clubId为必传参数
      if (!clubId) throw new Error("社团ID不能为空");
      
      this.loading = true;
      this.error = null;
      try {
        const res = await getClubJoinApplyAPI(clubId, params);
        this.applyList = res.data.list;
        return res.data;
      } catch (err) {
        this.error = err.message || "获取社团加入申请失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取管理员视角的所有申请列表（管理员端）=
    async getAdminApplyList(params = {}) { // 优化：明确type必传，简化逻辑
      if (!params.type) throw new Error("请指定申请类型（type: join/activity）");
      
      this.loading = true;
      this.error = null;
      try {
        let res;
        if (params.type === "activity") {
          // 管理员查看所有活动申请
          res = await getActivityApplyListAPI(params);
        } else {
          // 管理员查看所有社团加入申请（无需clubId，API需支持查全部）
          res = await getClubJoinApplyAPI(null, params);
        }
        this.applyList = res.data.list;
        return res.data;
      } catch (err) {
        this.error = err.message || `获取${params.type === 'activity' ? '活动' : '社团'}申请列表失败`;
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 处理申请（批准/拒绝，管理端通用）
    async handleApply(id, data) {
      if (!id || !data.type || !['approved', 'rejected'].includes(data.status)) {
        throw new Error("参数错误：需传入申请ID、类型（type）和处理状态（status）");
      }

      this.loading = true;
      this.error = null;
      try {
        let res;
        // 根据申请类型调用对应处理接口
        if (data.type === "join") {
          res = await handleClubJoinApplyAPI(id, data);
        } else if (data.type === "activity") {
          res = await handleActivityApplyAPI(id, data);
        } else {
          throw new Error("不支持的申请类型");
        }

        // 同步更新本地列表（优化：避免重复请求）
        const index = this.applyList.findIndex(item => item.id === id);
        if (index !== -1) {
          this.applyList[index] = { ...this.applyList[index], ...res.data };
        }

        // 活动申请通过后，同步活动列表（保持原逻辑）
        if (data.type === "activity" && data.status === "approved") {
          const activityStore = useActivityStore();
          await activityStore.getActivityList();
        }

        return res.data;
      } catch (err) {
        this.error = err.message || "处理申请失败";
        console.error(this.error);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // 获取单个申请的详情（扩展功能，可选）
    // async getApplyDetail(id) {
    //   if (!id) throw new Error("申请ID不能为空");
      
    //   this.loading = true;
    //   this.error = null;
    //   try {
    //     const res = await getApplyDetailAPI(id);
    //     this.currentApply = res.data;
    //     return res.data;
    //   } catch (err) {
    //     this.error = err.message || "获取申请详情失败";
    //     console.error(this.error);
    //     throw err;
    //   } finally {
    //     this.loading = false;
    //   }
    // }
  }
});