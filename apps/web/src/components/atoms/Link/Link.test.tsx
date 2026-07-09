import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { axe } from '../../../test/a11y'
import { Link } from './Link'

describe('Link', () => {
  it('renders its text and href', () => {
    render(
      <MemoryRouter>
        <Link to="/recuperar-senha">Esqueci a senha</Link>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Esqueci a senha' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/recuperar-senha')
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <Link to="/recuperar-senha">Esqueci a senha</Link>
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})
