import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { SocialLogin } from './SocialLogin'

describe('SocialLogin', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <SocialLogin />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders social buttons and the signup link', () => {
    render(
      <MemoryRouter>
        <SocialLogin />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/cadastro')
  })

  it('calls the respective handler when a social button is clicked', async () => {
    const user = userEvent.setup()
    const onGithubClick = vi.fn()
    const onGoogleClick = vi.fn()
    render(
      <MemoryRouter>
        <SocialLogin onGithubClick={onGithubClick} onGoogleClick={onGoogleClick} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Github' }))
    await user.click(screen.getByRole('button', { name: 'Gmail' }))

    expect(onGithubClick).toHaveBeenCalledTimes(1)
    expect(onGoogleClick).toHaveBeenCalledTimes(1)
  })

  it('renders a custom prompt, link label and href when provided', () => {
    render(
      <MemoryRouter>
        <SocialLogin
          promptText="Já tem conta?"
          linkLabel="Faça seu login!"
          signupHref="/login"
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Já tem conta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
