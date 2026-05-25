import api from './axios'

export const uploadExcel = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/imports/upload', form)
}

export const getImports = (params) => api.get('/imports', { params })

export const deleteImport = (id) => api.delete(`/imports/${id}`)
