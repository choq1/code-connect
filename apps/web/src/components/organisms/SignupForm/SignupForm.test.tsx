import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { SignupForm } from './SignupForm'

describe('SignupForm', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<SignupForm />)
    expect(await axe(container)).toHaveNoViolations()
  })

  it('has no accessibility violations with validation errors shown', async () => {
    const user = userEvent.setup()
    const { container } = render(<SignupForm />)

    await user.click(screen.getByRole('button', { name: /cadastrar/i }))
    await screen.findAllByRole('alert')

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the name, email, password fields and submit button', () => {
    render(<SignupForm />)

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cadastrar/i })).toBeInTheDocument()
  })

  it('shows validation errors and does not submit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(await screen.findAllByRole('alert')).toHaveLength(3)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits with the filled values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SignupForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome'), 'Fulano de Tal')
    await user.type(screen.getByLabelText('Email'), 'fulano@email.com')
    await user.type(screen.getByLabelText('Senha'), 'segredo123')
    await user.click(screen.getByRole('button', { name: /cadastrar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Fulano de Tal',
      email: 'fulano@email.com',
      password: 'segredo123',
      remember: true,
    })
  })

  it('shows the submit error message when provided', () => {
    render(<SignupForm submitError="Email já cadastrado" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Email já cadastrado')
  })

  it('disables the submit button while submitting', () => {
    render(<SignupForm isSubmitting />)

    expect(screen.getByRole('button', { name: /cadastrando/i })).toBeDisabled()
  })
})
