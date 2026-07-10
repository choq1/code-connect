import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

vi.mock('./http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('posts service', () => {
  beforeEach(() => {
    vi.mocked(http.get).mockReset()
    vi.mocked(http.post).mockReset()
    vi.mocked(http.delete).mockReset()
  })

  it('lists posts passing search/tag/page as query params', async () => {
    const { listPosts } = await import('./posts')
    const paginated = { items: [], total: 0, page: 1, limit: 9 }
    vi.mocked(http.get).mockResolvedValueOnce({ data: paginated })

    const result = await listPosts({ search: 'react', page: 1 })

    expect(http.get).toHaveBeenCalledWith('/posts', {
      params: { search: 'react', page: 1 },
    })
    expect(result).toEqual(paginated)
  })

  it('fetches a post by id', async () => {
    const { getPost } = await import('./posts')
    const post = { id: '1', title: 'Título' }
    vi.mocked(http.get).mockResolvedValueOnce({ data: post })

    const result = await getPost('1')

    expect(http.get).toHaveBeenCalledWith('/posts/1')
    expect(result).toEqual(post)
  })

  it('creates a post via POST /posts', async () => {
    const { createPost } = await import('./posts')
    const input = { title: 'Título', description: 'Desc', code: 'code' }
    const created = { id: '1', ...input }
    vi.mocked(http.post).mockResolvedValueOnce({ data: created })

    const result = await createPost(input)

    expect(http.post).toHaveBeenCalledWith('/posts', input)
    expect(result).toEqual(created)
  })

  it('likes a post via POST /posts/:id/likes', async () => {
    const { likePost } = await import('./posts')
    vi.mocked(http.post).mockResolvedValueOnce({
      data: { likeCount: 1, likedByMe: true },
    })

    const result = await likePost('1')

    expect(http.post).toHaveBeenCalledWith('/posts/1/likes')
    expect(result).toEqual({ likeCount: 1, likedByMe: true })
  })

  it('unlikes a post via DELETE /posts/:id/likes', async () => {
    const { unlikePost } = await import('./posts')
    vi.mocked(http.delete).mockResolvedValueOnce({
      data: { likeCount: 0, likedByMe: false },
    })

    const result = await unlikePost('1')

    expect(http.delete).toHaveBeenCalledWith('/posts/1/likes')
    expect(result).toEqual({ likeCount: 0, likedByMe: false })
  })

  it('creates a comment via POST /posts/:id/comments', async () => {
    const { createComment } = await import('./posts')
    vi.mocked(http.post).mockResolvedValueOnce({ data: [] })

    const result = await createComment('1', { body: 'Legal!' })

    expect(http.post).toHaveBeenCalledWith('/posts/1/comments', {
      body: 'Legal!',
    })
    expect(result).toEqual([])
  })
})
