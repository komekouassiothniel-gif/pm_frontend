import api from './axios'

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const changePassword = (data) =>
  api.patch('/auth/change-password', data)
