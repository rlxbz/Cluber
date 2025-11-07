import request from '@/utils/http'

export const getNoticeListAPI = (params) => {
  return request.get('/notice/list', { params })
}

export const getNoticeDetailAPI = (id) => {
  return request.get(`/notice/${id}`)
}