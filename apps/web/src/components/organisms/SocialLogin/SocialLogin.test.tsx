import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLogin } from './SocialLogin'

describe('SocialLogin', () => {
  it('renders social buttons and the signup link', () => {
    render(<SocialLogin />)

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
      <SocialLogin onGithubClick={onGithubClick} onGoogleClick={onGoogleClick} />,
    )

    await user.click(screen.getByRole('button', { name: 'Github' }))
    await user.click(screen.getByRole('button', { name: 'Gmail' }))

    expect(onGithubClick).toHaveBeenCalledTimes(1)
    expect(onGoogleClick).toHaveBeenCalledTimes(1)
  })
})
