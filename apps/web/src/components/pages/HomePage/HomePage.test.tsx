import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getMe, logout } from '../../../services/auth'
import { HomePage } from './HomePage'

vi.mock('../../../services/auth', () => ({
  getMe: vi.fn(),
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

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
    vi.mocked(logout).mockReset()
    mockNavigate.mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    vi.mocked(getMe).mockResolvedValue({ id: '1', name: 'Ana', email: 'ana@example.com' })

    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await screen.findByText(/ana@example.com/)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the authenticated user data', async () => {
    vi.mocked(getMe).mockResolvedValue({ id: '1', name: 'Ana', email: 'ana@example.com' })

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/Ana/)).toBeInTheDocument()
    expect(screen.getByText(/ana@example.com/)).toBeInTheDocument()
  })

  it('redirects to /login when fetching the user fails', async () => {
    vi.mocked(getMe).mockRejectedValue(new Error('unauthorized'))

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(logout).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('logs out and navigates to /login when clicking sair', async () => {
    vi.mocked(getMe).mockResolvedValue({ id: '1', name: 'Ana', email: 'ana@example.com' })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )

    await screen.findByText(/Ana/)
    await user.click(screen.getByRole('button', { name: /sair/i }))

    expect(logout).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})
