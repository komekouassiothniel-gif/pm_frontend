import api from './axios'

export const getRapportPassages = (params) => api.get('/rapports/passages', { params })

export const exportRapportExcel = (params) =>
  api.get('/rapports/passages/export-excel', { params, responseType: 'blob' })
