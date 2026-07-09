import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders with a placeholder', () => {
    render(<Input placeholder="usuario123" />)
    expect(screen.getByPlaceholderText('usuario123')).toBeInTheDocument()
  })

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="usuario123" onChange={() => {}} />)

    const input = screen.getByPlaceholderText('usuario123')
    await user.type(input, 'gabriel')

    expect(input).toHaveValue('gabriel')
  })

  it('respects the type prop', () => {
    render(<Input type="password" placeholder="senha" />)
    expect(screen.getByPlaceholderText('senha')).toHaveAttribute(
      'type',
      'password',
    )
  })
})
