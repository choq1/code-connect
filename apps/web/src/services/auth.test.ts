import { AxiosError } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

vi.mock('./http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const TOKEN_KEY = 'code-connect:token'

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(http.post).mockReset()
    vi.mocked(http.get).mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers a user via POST /users', async () => {
    const { register } = await import('./auth')
    const user = { id: '1', name: 'Ana', email: 'ana@example.com' }
    vi.mocked(http.post).mockResolvedValueOnce({ data: user })

    const result = await register({ name: 'Ana', email: 'ana@example.com', password: '123456' })

    expect(http.post).toHaveBeenCalledWith('/users', {
      name: 'Ana',
      email: 'ana@example.com',
      password: '123456',
    })
    expect(result).toEqual(user)
  })

  it('logs in and stores the access token', async () => {
    const { login, getToken } = await import('./auth')
    vi.mocked(http.post).mockResolvedValueOnce({ data: { access_token: 'jwt-token' } })

    const token = await login({ email: 'ana@example.com', password: '123456' })

    expect(http.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@example.com',
      password: '123456',
    })
    expect(token).toBe('jwt-token')
    expect(getToken()).toBe('jwt-token')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-token')
  })

  it('fetches the current user via GET /auth/me', async () => {
    const { getMe } = await import('./auth')
    const user = { id: '1', name: 'Ana', email: 'ana@example.com' }
    vi.mocked(http.get).mockResolvedValueOnce({ data: user })

    const result = await getMe()

    expect(http.get).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(user)
  })

  it('clears the stored token on logout', async () => {
    const { login, logout, getToken } = await import('./auth')
    vi.mocked(http.post).mockResolvedValueOnce({ data: { access_token: 'jwt-token' } })
    await login({ email: 'ana@example.com', password: '123456' })

    logout()

    expect(getToken()).toBeNull()
  })

  it('extracts a message from an axios error response', async () => {
    const { getAuthErrorMessage } = await import('./auth')
    const error = new AxiosError('Request failed')
    error.response = {
      data: { message: 'Credenciais inválidas' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {} as never,
    }

    expect(getAuthErrorMessage(error)).toBe('Credenciais inválidas')
  })

  it('falls back to a generic message for unknown errors', async () => {
    const { getAuthErrorMessage } = await import('./auth')

    expect(getAuthErrorMessage(new Error('boom'))).toBe(
      'Não foi possível completar a solicitação. Tente novamente.',
    )
  })
})
