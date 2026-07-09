import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { FormField } from './FormField'

describe('FormField', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<FormField label="Email ou usuário" name="email" />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations when showing an error', async () => {
    const { container } = render(
      <FormField label="Senha" name="password" error="Campo obrigatório" />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

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
