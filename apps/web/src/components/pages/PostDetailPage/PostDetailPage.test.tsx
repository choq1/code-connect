import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken } from '../../../services/auth'
import { createComment, getPost, likePost, type PostDetail, unlikePost } from '../../../services/posts'
import { PostDetailPage } from './PostDetailPage'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../../services/posts', () => ({
  getPost: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
  createComment: vi.fn(),
}))

const post: PostDetail = {
  id: 'post-1',
  title: 'Título do post',
  description: 'Descrição do post',
  tags: ['React'],
  thumbnailUrl: null,
  author: { id: 'user-1', name: 'Júlio Lima', username: 'julio', avatarUrl: null },
  likeCount: 2,
  commentCount: 1,
  likedByMe: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  code: "console.log('oi')",
  language: 'javascript',
  comments: [
    {
      id: 'c1',
      body: 'Muito bom!',
      author: { id: 'user-2', name: 'Márcia', username: 'marcia', avatarUrl: null },
      createdAt: '2026-01-01T00:00:00.000Z',
      replies: [],
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/posts/post-1']}>
      <Routes>
        <Route path="/posts/:id" element={<PostDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue(null)
    vi.mocked(getPost).mockReset()
    vi.mocked(likePost).mockReset()
    vi.mocked(unlikePost).mockReset()
    vi.mocked(createComment).mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    vi.mocked(getPost).mockResolvedValue(post)

    const { container } = renderPage()
    await screen.findByText('Título do post')

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the post, its code and comments', async () => {
    vi.mocked(getPost).mockResolvedValue(post)

    renderPage()

    expect(await screen.findByText('Título do post')).toBeInTheDocument()
    expect(screen.getByText("console.log('oi')")).toBeInTheDocument()
    expect(screen.getByText('Muito bom!')).toBeInTheDocument()
  })

  it('shows an error message when the post fails to load', async () => {
    vi.mocked(getPost).mockRejectedValue(new Error('not found'))

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar/i)
  })

  it('disables liking and shows a login prompt for comments when logged out', async () => {
    vi.mocked(getPost).mockResolvedValue(post)

    renderPage()
    await screen.findByText('Título do post')

    expect(screen.getByTitle('Faça login para curtir')).toBeDisabled()
    expect(screen.getByRole('link', { name: /faça login/i })).toHaveAttribute('href', '/login')
  })

  it('lets a logged-in user like the post and add a comment', async () => {
    vi.mocked(getToken).mockReturnValue('jwt-token')
    vi.mocked(getPost).mockResolvedValue(post)
    vi.mocked(likePost).mockResolvedValue({ likeCount: 3, likedByMe: true })
    vi.mocked(createComment).mockResolvedValue([
      ...post.comments,
      {
        id: 'c2',
        body: 'Novo comentário',
        author: { id: 'user-3', name: 'Gabriel', username: 'gabriel_luz', avatarUrl: null },
        createdAt: '2026-01-02T00:00:00.000Z',
        replies: [],
      },
    ])
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('Título do post')

    await user.click(screen.getByTitle('Curtir'))
    expect(await screen.findByText('3')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: /escreva um comentário/i }), 'Novo comentário')
    await user.click(screen.getByRole('button', { name: /^comentar$/i }))

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith('post-1', {
        body: 'Novo comentário',
        parentId: undefined,
      })
    })
    expect(await screen.findByText('Novo comentário')).toBeInTheDocument()
  })
})
