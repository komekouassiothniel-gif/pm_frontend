import api from './axios'

export const resetSystem = () => api.delete('/admin/reset-system')
