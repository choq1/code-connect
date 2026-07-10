import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getToken } from '../../../services/auth'
import {
  createComment,
  getPost,
  likePost,
  type PostDetail,
  unlikePost,
} from '../../../services/posts'
import { Tag } from '../../atoms/Tag/Tag'
import { CommentForm } from '../../organisms/CommentForm/CommentForm'
import { CommentList } from '../../organisms/CommentList/CommentList'
import { PostStats } from '../../molecules/PostStats/PostStats'
import { PostThumbnail } from '../../molecules/PostThumbnail/PostThumbnail'
import { AppShell } from '../../templates/AppShell/AppShell'

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<PostDetail>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const canInteract = Boolean(getToken())

  useEffect(() => {
    if (!id) return
    let isMounted = true
    setIsLoading(true)
    setError(undefined)

    getPost(id)
      .then((result) => {
        if (isMounted) setPost(result)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar este post.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  async function handleToggleLike() {
    if (!post) return
    setIsTogglingLike(true)
    try {
      const result = post.likedByMe ? await unlikePost(post.id) : await likePost(post.id)
      setPost({ ...post, likeCount: result.likeCount, likedByMe: result.likedByMe })
    } catch {
      // Mantém o estado anterior em caso de falha na requisição.
    } finally {
      setIsTogglingLike(false)
    }
  }

  async function handleComment(body: string, parentId?: string) {
    if (!post) return
    const comments = await createComment(post.id, { body, parentId })
    setPost({ ...post, comments, commentCount: countComments(comments) })
  }

  if (isLoading) {
    return (
      <AppShell>
        <p className="text-text-muted">Carregando post...</p>
      </AppShell>
    )
  }

  if (error || !post) {
    return (
      <AppShell>
        <p role="alert" className="text-danger">
          {error ?? 'Post não encontrado.'}
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        <article className="flex flex-col gap-6">
          <PostThumbnail
            thumbnailUrl={post.thumbnailUrl}
            title={post.title}
            className="h-[320px] w-full"
          />

          <div className="flex flex-col gap-4 rounded-lg bg-card p-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-text">{post.title}</h1>
              <p className="text-sm text-text-muted">{post.description}</p>
            </div>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <PostStats
                likeCount={post.likeCount}
                commentCount={post.commentCount}
                likedByMe={post.likedByMe}
                canInteract={canInteract}
                onToggleLike={handleToggleLike}
                isTogglingLike={isTogglingLike}
              />

              <div className="flex items-center gap-2">
                {post.author.avatarUrl && (
                  <img src={post.author.avatarUrl} alt="" className="size-8 rounded-full" />
                )}
                <span className="text-sm font-semibold text-text-muted">
                  @{post.author.username ?? post.author.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-text-muted">Código:</h2>
            <pre className="overflow-x-auto rounded-lg bg-card p-4 text-sm text-text-muted">
              <code>{post.code}</code>
            </pre>
          </div>
        </article>

        <section className="flex flex-col gap-6 rounded-lg bg-card p-6">
          <h2 className="text-xl font-semibold text-text">Comentários</h2>

          <CommentForm
            canInteract={canInteract}
            onSubmit={(body) => handleComment(body)}
          />

          <CommentList
            comments={post.comments}
            canInteract={canInteract}
            onReply={(parentId, body) => handleComment(body, parentId)}
          />
        </section>
      </div>
    </AppShell>
  )
}

function countComments(comments: PostDetail['comments']): number {
  return comments.reduce((total, comment) => total + 1 + countComments(comment.replies), 0)
}
