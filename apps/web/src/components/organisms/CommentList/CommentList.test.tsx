import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import type { Comment } from '../../../services/posts'
import { CommentList } from './CommentList'

const comments: Comment[] = [
  {
    id: 'c1',
    body: 'Primeiro comentário',
    author: { id: 'user-1', name: 'Júlio Lima', username: 'julio', avatarUrl: null },
    createdAt: '2026-01-01T00:00:00.000Z',
    replies: [],
  },
  {
    id: 'c2',
    body: 'Segundo comentário',
    author: { id: 'user-2', name: 'Márcia Souza', username: 'marcia', avatarUrl: null },
    createdAt: '2026-01-02T00:00:00.000Z',
    replies: [],
  },
]

describe('CommentList', () => {
  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <CommentList comments={comments} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders every top-level comment', () => {
    render(
      <MemoryRouter>
        <CommentList comments={comments} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Primeiro comentário')).toBeInTheDocument()
    expect(screen.getByText('Segundo comentário')).toBeInTheDocument()
  })

  it('shows an empty state when there are no comments', () => {
    render(
      <MemoryRouter>
        <CommentList comments={[]} canInteract onReply={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/seja o\(a\) primeiro/i)).toBeInTheDocument()
  })
})
