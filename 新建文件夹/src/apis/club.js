import request from '@/utils/http'

// 获取社团列表（支持搜索、分页、筛选）
export const getClubListAPI = (params = {}) => {
  return request.get('/club/list', {
    params: {
      page: 1,
      size: 10,
      searchKey: '',
      category: '',
      ...params
    }
  })
}

// 获取社团详情
export const getClubDetailAPI = (id) => {
  return request.get(`/club/${id}`)
}

// 获取我的社团列表
export const getMyClubListAPI = () => {
  return request.get('/club/my')
}

// 获取社团成员列表
export const getClubMembersAPI = (clubId) => {
  return request.get(`/club/${clubId}/members`);
};

// 处理社团加入申请
export const handleClubJoinApplyAPI = (applyId, data) => {
  return request.post(`/apply/club/join/${applyId}/handle`, data);
};