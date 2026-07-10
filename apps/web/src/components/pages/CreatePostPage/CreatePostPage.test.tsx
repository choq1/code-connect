import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from '../../../test/a11y'
import { getToken } from '../../../services/auth'
import { createPost } from '../../../services/posts'
import { CreatePostPage } from './CreatePostPage'

vi.mock('../../../services/auth', () => ({
  getToken: vi.fn(),
  logout: vi.fn(),
  getAuthErrorMessage: vi.fn(() => 'Erro genérico'),
}))

vi.mock('../../../services/posts', () => ({
  createPost: vi.fn(),
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreatePostPage', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue('jwt-token')
    vi.mocked(createPost).mockReset()
    mockNavigate.mockReset()
  })

  it('has no accessibility violations (WCAG 2.1 AA)', async () => {
    const { container } = render(
      <MemoryRouter>
        <CreatePostPage />
      </MemoryRouter>,
    )

    expect(await axe(container)).toHaveNoViolations()
  })

  it('creates a post and navigates to its detail page', async () => {
    vi.mocked(createPost).mockResolvedValue({ id: 'post-1' } as never)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CreatePostPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Título'), 'Meu post')
    await user.type(screen.getByLabelText('Descrição'), 'Uma descrição')
    await user.type(screen.getByLabelText('Código'), 'console.log(1)')
    await user.click(screen.getByRole('button', { name: /publicar/i }))

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Meu post',
        description: 'Uma descrição',
        code: 'console.log(1)',
      }),
    )
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/posts/post-1')
    })
  })
})
