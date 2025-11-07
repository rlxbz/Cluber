import request from '@/utils/http'

// 获取热门活动列表
export const getHotActivityAPI = () => {
  return request.get('/activity/hot')
}

// 获取活动列表（支持社团筛选、分页）
export const getActivityListAPI = (params) => {
  return request.get('/activity/list', { params })
}

// 获取活动详情
export const getActivityDetailAPI = (id) => {
  return request.get(`/activity/${id}`)
}

// 活动报名
export const signUpActivityAPI = (id) => {
  return request.post(`/activity/${id}/signup`)
}

// 取消活动报名
export const cancelSignUpAPI = (activityId) => {
  return request.post(`/activity/${activityId}/cancel-signup`)
}

// 检查是否已报名
export const checkSignUpStatusAPI = (activityId) => {
  return request.get(`/activity/${activityId}/signup-status`)
}

export const getClubActivityListAPI = (params) => {
  return request.get('/activity/club', { params })
}