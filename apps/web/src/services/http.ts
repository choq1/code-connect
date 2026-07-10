import axios from 'axios'
import { getToken } from './auth'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})
