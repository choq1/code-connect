import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders a labeled input', () => {
    render(<FormField label="Email ou usuário" name="email" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })

  it('forwards input props like value and onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FormField label="Senha" name="password" type="password" onChange={onChange} />,
    )

    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')

    await user.type(input, '123456')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows an error message when provided', () => {
    render(<FormField label="Senha" name="password" error="Campo obrigatório" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obrigatório')
  })
})
