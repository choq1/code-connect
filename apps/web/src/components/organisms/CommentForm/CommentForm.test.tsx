import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { CommentForm } from './CommentForm'

describe('CommentForm', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} canInteract />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows a login prompt instead of the form for anonymous visitors', () => {
    render(
      <MemoryRouter>
        <CommentForm onSubmit={vi.fn()} canInteract={false} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /faça login/i })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })

  it('submits the typed comment and clears the field', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CommentForm onSubmit={onSubmit} canInteract />
      </MemoryRouter>,
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Muito bom!')
    await user.click(screen.getByRole('button', { name: /comentar/i }))

    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
    expect(input).toHaveValue('')
  })

  it('does not submit an empty comment', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CommentForm onSubmit={onSubmit} canInteract />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /comentar/i }))

    expect(onSubmit).not.toHaveBeenCalled()
  })
})
