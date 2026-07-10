import { useState } from 'react'
import type { Comment } from '../../../services/posts'
import { CommentForm } from '../CommentForm/CommentForm'

interface CommentItemProps {
  comment: Comment
  canInteract: boolean
  onReply: (parentId: string, body: string) => Promise<void>
  depth?: number
}

export function CommentItem({ comment, canInteract, onReply, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const hasReplies = comment.replies.length > 0
  const authorHandle = comment.author.username ?? comment.author.name

  async function handleReplySubmit(body: string) {
    await onReply(comment.id, body)
    setIsReplying(false)
  }

  return (
    <div className={`flex flex-col gap-2 ${depth > 0 ? 'pl-10' : ''}`}>
      <div className="flex items-start gap-2">
        {comment.author.avatarUrl ? (
          <img src={comment.author.avatarUrl} alt="" className="size-8 shrink-0 rounded-full" />
        ) : (
          <div className="size-8 shrink-0 rounded-full bg-text-muted" aria-hidden="true" />
        )}
        <p className="text-text">
          <span className="font-semibold">@{authorHandle}</span> {comment.body}
        </p>
      </div>

      <div className="flex items-center gap-4 pl-10 text-sm">
        {canInteract && (
          <button
            type="button"
            onClick={() => setIsReplying((prev) => !prev)}
            className="font-semibold text-text"
          >
            Responder
          </button>
        )}
        {hasReplies && (
          <button
            type="button"
            onClick={() => setShowReplies((prev) => !prev)}
            className="text-text-muted"
          >
            {showReplies ? 'Ocultar respostas' : 'Ver respostas'}
          </button>
        )}
      </div>

      {isReplying && (
        <div className="pl-10">
          <CommentForm
            canInteract={canInteract}
            onSubmit={handleReplySubmit}
            placeholder={`Respondendo @${authorHandle}`}
            submitLabel="Responder"
          />
        </div>
      )}

      {showReplies &&
        comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            canInteract={canInteract}
            onReply={onReply}
            depth={depth + 1}
          />
        ))}
    </div>
  )
}
