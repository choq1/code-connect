import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { Button } from './Button'

describe('Button', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<Button>Login</Button>)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders its children', () => {
    render(<Button>Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Login</Button>)

    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects the disabled prop', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Login
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Login' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is full width by default', () => {
    render(<Button>Login</Button>)
    expect(screen.getByRole('button', { name: 'Login' })).toHaveClass('w-full')
  })

  it('does not apply w-full when fullWidth is false', () => {
    render(<Button fullWidth={false}>Sair</Button>)
    expect(screen.getByRole('button', { name: 'Sair' })).not.toHaveClass('w-full')
  })
})
