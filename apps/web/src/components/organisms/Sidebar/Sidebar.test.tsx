import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken, logout } from '../../../services/auth'
import { Sidebar } from './Sidebar'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Sidebar', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReset()
    vi.mocked(logout).mockReset()
    mockNavigate.mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    vi.mocked(getToken).mockReturnValue(null)

    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows a Login link when there is no session', () => {
    vi.mocked(getToken).mockReturnValue(null)

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument()
  })

  it('shows a Sair button that logs out when there is a session', async () => {
    vi.mocked(getToken).mockReturnValue('jwt-token')
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    const sairButton = screen.getByRole('button', { name: /sair/i })
    expect(sairButton).toBeInTheDocument()

    await user.click(sairButton)

    expect(logout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/feed')
  })

  it('links Publicar to the create post route', () => {
    vi.mocked(getToken).mockReturnValue(null)

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /publicar/i })).toHaveAttribute(
      'href',
      '/publicar',
    )
  })
})
