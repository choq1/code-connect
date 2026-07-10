import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { PostForm } from './PostForm'

describe('PostForm', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(<PostForm onSubmit={vi.fn()} />)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows validation errors when required fields are empty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PostForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(await screen.findByText('Informe um título')).toBeInTheDocument()
    expect(screen.getByText('Informe uma descrição')).toBeInTheDocument()
    expect(screen.getByText('Cole o código do seu post')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the parsed values, splitting tags by comma', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<PostForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Título'), 'Meu post')
    await user.type(screen.getByLabelText('Descrição'), 'Uma descrição')
    await user.type(screen.getByLabelText('Código'), 'console.log(1)')
    await user.type(screen.getByLabelText('Linguagem (opcional)'), 'javascript')
    await user.type(screen.getByLabelText('Tags (separadas por vírgula)'), 'React, Front-end')

    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Meu post',
      description: 'Uma descrição',
      code: 'console.log(1)',
      language: 'javascript',
      tags: ['React', 'Front-end'],
      thumbnailUrl: undefined,
    })
  })

  it('shows the submit error message when provided', () => {
    render(<PostForm onSubmit={vi.fn()} submitError="Algo deu errado" />)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado')
  })
})
