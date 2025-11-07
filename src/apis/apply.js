import request from "@/utils/http";

// 申请加入社团
export const applyJoinClubAPI = (data) => {
  return request.post("/apply/join", data);
};

// 申请创建社团
export const applyCreateClubAPI = (data) => {
  return request.post("/apply/create", data);
};

// 获取我的申请列表
export const getUserApplyListAPI = (params = {}) => {
  return request.get("/apply/my", { params });
};

// 获取社团的加入申请列表（管理员用）
export const getClubJoinApplyAPI = (clubId, params = {}) => {
  return request.get("/apply/club/join", {
    params: { clubId, ...params },
  });
};

// 处理社团加入申请（管理员用）
export const handleClubJoinApplyAPI = (id, data) => {
  return request.post(`/apply/club/join/${id}/handle`, data);
};

// 申请举办活动
export const applyActivityAPI = (data) => {
  return request.post("/apply/activity", data);
};

// 处理活动申请（管理员用）
export const handleActivityApplyAPI = (id, data) => {
  return request.post(`/apply/activity/${id}/handle`, data);
};

// 获取活动申请列表（管理员用）
export const getActivityApplyListAPI = (params = {}) => {
  return request.get("/apply/activity/list", { params });
};