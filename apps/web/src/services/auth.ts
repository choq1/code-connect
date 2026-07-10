import { AxiosError } from 'axios'
import { http } from './http'

const TOKEN_KEY = 'code-connect:token'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface Credentials {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message as string | string[] | undefined
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (message) {
      return message
    }
  }
  return 'Não foi possível completar a solicitação. Tente novamente.'
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const { data } = await http.post<AuthUser>('/users', input)
  return data
}

export async function login(credentials: Credentials): Promise<string> {
  const { data } = await http.post<{ access_token: string }>('/auth/login', credentials)
  setToken(data.access_token)
  return data.access_token
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await http.get<AuthUser>('/auth/me')
  return data
}

export function logout(): void {
  clearToken()
}
