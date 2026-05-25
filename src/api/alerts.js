import api from './axios'

export const getAlerts = (params) => api.get('/alerts', { params })
export const countNewAlerts = () => api.get('/alerts/count')
export const updateAlert = (id, data) => api.patch(`/alerts/${id}`, data)
export const closeAlert = (id) => api.delete(`/alerts/${id}`)
