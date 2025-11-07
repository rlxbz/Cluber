import { defineStore } from "pinia";
import {
  getClubListAPI,
  getClubDetailAPI,
  getClubMembersAPI,
  getMyClubListAPI,
} from "@/apis/club";

export const useClubStore = defineStore("club", {
  state: () => ({
    clubList: [],
    currentClub: null,
    myClubs: [],
    members: [],
    loading: false,
    error: null,
    total: 0,
  }),
  actions: {
    // 获取社团列表
    async getClubList(params) {
      this.loading = true;
      try {
        const res = await getClubListAPI(params);
        this.clubList = res.data.list || [];
        this.total = res.data.total || 0;
        return res.data;
      } catch (error) {
        console.error("获取社团列表失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setCurrentClub(clubData) {
      this.currentClub = clubData;
    },

    // 获取社团详情
    async getClubDetail(id) {
      this.loading = true;
      try {
        const res = await getClubDetailAPI(id);
        this.currentClub = res.data;
        return res.data;
      } catch (error) {
        console.error("获取社团详情失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取我的社团列表
    async getMyClubList() {
      this.loading = true;
      try {
        const res = await getMyClubListAPI();
        this.myClubs = res.data || [];
        return this.myClubs;
      } catch (error) {
        console.error("获取我的社团列表失败:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 获取社团成员列表
    async getClubMembers(clubId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getClubMembersAPI(clubId); // 复用统一API
        this.members = response.data || [];
        return this.members;
      } catch (error) {
        this.error = error.message || "获取成员列表失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setSearchKey(key) {
      this.searchKey = key;
    },

    // 新增：设置分页参数（如果需要）
    setPageParams({ currentPage, pageSize }) {
      this.currentPage = currentPage;
      this.pageSize = pageSize;
    },
    // 设置管理员
    async setManager({ clubId, userId }) {
      return request.post("/club/set-manager", { clubId, userId });
    },
    // 移除成员
    async removeMember({ clubId, userId }) {
      this.loading = true;
      this.error = null;
      try {
        const response = await request.post("/club/remove-member", {
          clubId,
          userId,
        });
        return response.data;
      } catch (error) {
        this.error = error.message || "移除成员失败";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 添加成员
    async addMember({ clubId, studentId }) {
      return request.post("/club/add-member", { clubId, studentId });
    },
  },
});
