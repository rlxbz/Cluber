import request from '@/utils/http'

export const getPushListAPI = (params) => {
  return request.get('/push/list', { params })
}

export const getPushDetailAPI = (id) => {
  return request.get(`/push/${id}`)
}