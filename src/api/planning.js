import api from './axios'

export const getPlanning = (params) => api.get('/planning', { params })
export const getPlanningStats = (params) => api.get('/planning/stats', { params })
export const updatePassageStatut = (id, data) => api.patch(`/planning/${id}/statut`, data)
export const genererPlanning = (data) => api.post('/planning/generer', data)
export const replanifier = (data) => api.post('/planning/replanifier', data)
