import api from './axios'

export const chatAssistant = (data) => api.post('/assistant/chat', data)
