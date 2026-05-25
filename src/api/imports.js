import api from './axios'

export const uploadFichierSBC = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/imports/upload', form, { timeout: 60_000 })
}

export const getImports = (params) => api.get('/imports', { params })

export const getImport = (id) => api.get(`/imports/${id}`)

export const deleteImport = (id) => api.delete(`/imports/${id}`)
