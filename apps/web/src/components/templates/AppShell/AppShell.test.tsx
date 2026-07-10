import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken } from '../../../services/auth'
import { AppShell } from './AppShell'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
}))

describe('AppShell', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue(null)
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <AppShell>
          <p>Conteúdo</p>
        </AppShell>
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the sidebar alongside the page content', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <p>Conteúdo da página</p>
        </AppShell>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /feed/i })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument()
  })
})
