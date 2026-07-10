import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken } from '../../../services/auth'
import { likePost, type PostCard as PostCardData, unlikePost } from '../../../services/posts'
import { PostCard } from './PostCard'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
}))

vi.mock('../../../services/posts', () => ({
  likePost: vi.fn(),
  unlikePost: vi.fn(),
}))

const post: PostCardData = {
  id: 'post-1',
  title: 'Título do post',
  description: 'Uma descrição curta do post.',
  tags: ['React', 'Front-end'],
  thumbnailUrl: null,
  author: { id: 'user-1', name: 'Júlio Lima', username: 'julio', avatarUrl: null },
  likeCount: 2,
  commentCount: 1,
  likedByMe: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('PostCard', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReset()
    vi.mocked(likePost).mockReset()
    vi.mocked(unlikePost).mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    vi.mocked(getToken).mockReturnValue(null)

    const { container } = render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders the post title, description, tags and author', () => {
    vi.mocked(getToken).mockReturnValue(null)

    render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Título do post')).toBeInTheDocument()
    expect(screen.getByText('Uma descrição curta do post.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
    expect(screen.getByText('@julio')).toBeInTheDocument()
  })

  it('links the title to the post detail page', () => {
    vi.mocked(getToken).mockReturnValue(null)

    render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links.some((link) => link.getAttribute('href') === '/posts/post-1')).toBe(true)
  })

  it('disables liking for anonymous visitors', () => {
    vi.mocked(getToken).mockReturnValue(null)

    render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )

    expect(screen.getByTitle('Faça login para curtir')).toBeDisabled()
  })

  it('lets a logged-in user like the post', async () => {
    vi.mocked(getToken).mockReturnValue('jwt-token')
    vi.mocked(likePost).mockResolvedValue({ likeCount: 3, likedByMe: true })
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )

    await user.click(screen.getByTitle('Curtir'))

    expect(likePost).toHaveBeenCalledWith('post-1')
    expect(await screen.findByText('3')).toBeInTheDocument()
  })

  it('calls onTagClick when a tag is clicked', async () => {
    vi.mocked(getToken).mockReturnValue(null)
    const onTagClick = vi.fn()
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <PostCard post={post} onTagClick={onTagClick} />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'React' }))

    expect(onTagClick).toHaveBeenCalledWith('React')
  })
})
