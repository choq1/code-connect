import { http } from './http'

export interface Author {
  id: string
  name: string
  username: string | null
  avatarUrl: string | null
}

export interface PostCard {
  id: string
  title: string
  description: string
  tags: string[]
  thumbnailUrl: string | null
  author: Author
  likeCount: number
  commentCount: number
  likedByMe: boolean
  createdAt: string
}

export interface Comment {
  id: string
  body: string
  author: Author
  createdAt: string
  replies: Comment[]
}

export interface PostDetail extends PostCard {
  code: string
  language: string | null
  comments: Comment[]
}

export interface PaginatedPosts {
  items: PostCard[]
  total: number
  page: number
  limit: number
}

export interface ListPostsParams {
  search?: string
  tag?: string
  page?: number
  limit?: number
}

export interface CreatePostInput {
  title: string
  description: string
  code: string
  language?: string
  tags?: string[]
  thumbnailUrl?: string
}

export interface CreateCommentInput {
  body: string
  parentId?: string
}

export interface LikeStatus {
  likeCount: number
  likedByMe: boolean
}

export async function listPosts(params: ListPostsParams = {}): Promise<PaginatedPosts> {
  const { data } = await http.get<PaginatedPosts>('/posts', { params })
  return data
}

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await http.get<PostDetail>(`/posts/${id}`)
  return data
}

export async function createPost(input: CreatePostInput): Promise<PostDetail> {
  const { data } = await http.post<PostDetail>('/posts', input)
  return data
}

export async function likePost(id: string): Promise<LikeStatus> {
  const { data } = await http.post<LikeStatus>(`/posts/${id}/likes`)
  return data
}

export async function unlikePost(id: string): Promise<LikeStatus> {
  const { data } = await http.delete<LikeStatus>(`/posts/${id}/likes`)
  return data
}

export async function createComment(
  id: string,
  input: CreateCommentInput,
): Promise<Comment[]> {
  const { data } = await http.post<Comment[]>(`/posts/${id}/comments`, input)
  return data
}
