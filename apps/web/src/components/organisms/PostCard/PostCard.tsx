import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken } from '../../../services/auth'
import { likePost, type PostCard as PostCardData, unlikePost } from '../../../services/posts'
import { Tag } from '../../atoms/Tag/Tag'
import { PostStats } from '../../molecules/PostStats/PostStats'
import { PostThumbnail } from '../../molecules/PostThumbnail/PostThumbnail'

interface PostCardProps {
  post: PostCardData
  onTagClick?: (tag: string) => void
}

export function PostCard({ post, onTagClick }: PostCardProps) {
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [likedByMe, setLikedByMe] = useState(post.likedByMe)
  const [isTogglingLike, setIsTogglingLike] = useState(false)
  const canInteract = Boolean(getToken())

  async function handleToggleLike() {
    setIsTogglingLike(true)
    try {
      const result = likedByMe ? await unlikePost(post.id) : await likePost(post.id)
      setLikeCount(result.likeCount)
      setLikedByMe(result.likedByMe)
    } catch {
      // Mantém o estado anterior em caso de falha na requisição.
    } finally {
      setIsTogglingLike(false)
    }
  }

  return (
    <article className="flex w-full max-w-[486px] flex-col overflow-hidden rounded-lg">
      <Link to={`/posts/${post.id}`} className="no-underline">
        <PostThumbnail
          thumbnailUrl={post.thumbnailUrl}
          title={post.title}
          className="h-[240px] w-full"
        />
      </Link>

      <div className="flex flex-col gap-4 bg-card p-4">
        <div className="flex flex-col gap-2">
          <Link to={`/posts/${post.id}`} className="no-underline">
            <h3 className="text-lg font-semibold text-text">{post.title}</h3>
          </Link>
          <p className="line-clamp-3 text-sm text-text-muted">{post.description}</p>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag} label={tag} onClick={() => onTagClick?.(tag)} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <PostStats
            likeCount={likeCount}
            commentCount={post.commentCount}
            likedByMe={likedByMe}
            canInteract={canInteract}
            onToggleLike={handleToggleLike}
            isTogglingLike={isTogglingLike}
          />

          <div className="flex items-center gap-2">
            {post.author.avatarUrl && (
              <img
                src={post.author.avatarUrl}
                alt=""
                className="size-8 rounded-full"
              />
            )}
            <span className="text-sm font-semibold text-text-muted">
              @{post.author.username ?? post.author.name}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
