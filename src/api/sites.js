import api from './axios'

export const getSites = (params) => api.get('/sites', { params })
export const getSite = (code) => api.get(`/sites/${code}`)
export const getSiteDetail = (code, annee) =>
  api.get(`/sites/${code}/detail`, annee ? { params: { annee } } : {})
export const createSite = (data) => api.post('/sites', data)
export const updateSite = (code, data) => api.put(`/sites/${code}`, data)

export const uploadMiseAJourMensuelle = (file, annee = 2026) => {
  const form = new FormData()
  form.append('file', file)
  return api.post(`/sites/mise-a-jour-mensuelle?annee=${annee}`, form, { timeout: 60_000 })
}
