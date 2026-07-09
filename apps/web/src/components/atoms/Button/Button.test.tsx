import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
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
})
