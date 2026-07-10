import type { Comment } from '../../../services/posts'
import { CommentItem } from '../CommentItem/CommentItem'

interface CommentListProps {
  comments: Comment[]
  canInteract: boolean
  onReply: (parentId: string, body: string) => Promise<void>
}

export function CommentList({ comments, canInteract, onReply }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-sm text-text-muted">Seja o(a) primeiro(a) a comentar.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment, index) => (
        <div key={comment.id} className="flex flex-col gap-4">
          <CommentItem comment={comment} canInteract={canInteract} onReply={onReply} />
          {index < comments.length - 1 && <hr className="border-text-muted/20" />}
        </div>
      ))}
    </div>
  )
}
