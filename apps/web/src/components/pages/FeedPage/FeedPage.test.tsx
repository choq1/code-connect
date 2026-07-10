import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken } from '../../../services/auth'
import { listPosts, type PaginatedPosts } from '../../../services/posts'
import { FeedPage } from './FeedPage'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../../../services/posts', () => ({
  listPosts: vi.fn(),
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

const paginated: PaginatedPosts = {
  items: [
    {
      id: 'post-1',
      title: 'Título do post',
      description: 'Descrição do post',
      tags: ['React'],
      thumbnailUrl: null,
      author: { id: 'user-1', name: 'Júlio Lima', username: 'julio', avatarUrl: null },
      likeCount: 1,
      commentCount: 0,
      likedByMe: false,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 9,
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue(null)
    vi.mocked(listPosts).mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    vi.mocked(listPosts).mockResolvedValue(paginated)

    const { container } = render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByText('Título do post')

    expect(await axe(container)).toHaveNoViolations()
  })

  it('lists posts returned by the API', async () => {
    vi.mocked(listPosts).mockResolvedValue(paginated)

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Título do post')).toBeInTheDocument()
    expect(listPosts).toHaveBeenCalledWith({ search: undefined, tag: undefined, page: 1 })
  })

  it('shows an empty state when there are no posts', async () => {
    vi.mocked(listPosts).mockResolvedValue({ items: [], total: 0, page: 1, limit: 9 })

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/nenhum post encontrado/i)).toBeInTheDocument()
  })

  it('shows an error message when the request fails', async () => {
    vi.mocked(listPosts).mockRejectedValue(new Error('network error'))

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(/não foi possível carregar/i)
  })

  it('filters by tag when a tag is clicked and allows clearing it', async () => {
    vi.mocked(listPosts).mockResolvedValue(paginated)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <FeedPage />
      </MemoryRouter>,
    )

    await screen.findByText('Título do post')
    await user.click(screen.getByRole('button', { name: 'React' }))

    expect(await screen.findByText('React', { selector: 'span' })).toBeInTheDocument()
    expect(listPosts).toHaveBeenLastCalledWith({ search: undefined, tag: 'React', page: 1 })

    await user.click(screen.getByRole('button', { name: /limpar tudo/i }))

    expect(listPosts).toHaveBeenLastCalledWith({ search: undefined, tag: undefined, page: 1 })
  })
})
