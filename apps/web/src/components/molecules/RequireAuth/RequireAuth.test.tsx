import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireAuth } from './RequireAuth'

const TOKEN_KEY = 'code-connect:token'

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/home']}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <div>Protected content</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects to /login when there is no token', () => {
    renderWithRouter()

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders the children when a token is present', () => {
    localStorage.setItem(TOKEN_KEY, 'jwt-token')

    renderWithRouter()

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })
})
