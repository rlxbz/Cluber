import request from '@/utils/http'

export const loginAPI = (data) => {
  return request.post('/user/login', data)
}

export const getUserInfoAPI = () => {
  return request.get('/user/info')
}

export const registerAPI = (data) => {
  return request.post('/user/register', data)
}

export const updateUserInfoAPI = (data) => {
  return request.put('/user/info', data)
}