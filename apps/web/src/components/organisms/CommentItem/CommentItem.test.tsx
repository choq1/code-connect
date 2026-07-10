import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import type { Comment } from '../../../services/posts'
import { CommentItem } from './CommentItem'

const comment: Comment = {
  id: 'c1',
  body: 'Achei muito bom seu código!',
  author: { id: 'user-2', name: 'Márcia Souza', username: 'marcia', avatarUrl: null },
  createdAt: '2026-01-01T00:00:00.000Z',
  replies: [
    {
      id: 'c2',
      body: 'Até que foi rápido, uns 3 dias!',
      author: { id: 'user-1', name: 'Júlio Lima', username: 'julio', avatarUrl: null },
      createdAt: '2026-01-02T00:00:00.000Z',
      replies: [],
    },
  ],
}

describe('CommentItem', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <CommentItem comment={comment} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the comment body, author and nested replies', () => {
    render(
      <MemoryRouter>
        <CommentItem comment={comment} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/achei muito bom seu código/i)).toBeInTheDocument()
    expect(screen.getByText('@marcia')).toBeInTheDocument()
    expect(screen.getByText(/até que foi rápido/i)).toBeInTheDocument()
    expect(screen.getByText('@julio')).toBeInTheDocument()
  })

  it('hides the Responder action for anonymous visitors', () => {
    render(
      <MemoryRouter>
        <CommentItem comment={comment} canInteract={false} onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('button', { name: /responder/i })).not.toBeInTheDocument()
  })

  it('toggles the reply form and submits a reply', async () => {
    const onReply = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CommentItem comment={comment} canInteract onReply={onReply} />
      </MemoryRouter>,
    )

    await user.click(screen.getAllByRole('button', { name: /responder/i })[0])
    const replyInput = screen.getByPlaceholderText(/respondendo @marcia/i)
    await user.type(replyInput, 'Boa!')

    const replyForm = replyInput.closest('form')
    if (!replyForm) throw new Error('reply form not found')
    await user.click(within(replyForm).getByRole('button', { name: /responder/i }))

    await waitFor(() => {
      expect(onReply).toHaveBeenCalledWith('c1', 'Boa!')
    })
  })

  it('toggles visibility of replies', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CommentItem comment={comment} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /ocultar respostas/i }))

    expect(screen.queryByText(/até que foi rápido/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver respostas/i })).toBeInTheDocument()
  })
})
