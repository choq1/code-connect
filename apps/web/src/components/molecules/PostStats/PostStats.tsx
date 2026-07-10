import { ChatIcon, CodeIcon, ShareIcon } from '../../atoms/icons/Icons'

interface PostStatsProps {
  likeCount: number
  commentCount: number
  likedByMe: boolean
  canInteract: boolean
  onToggleLike?: () => void
  isTogglingLike?: boolean
}

// Reaproveitado no card do feed e na página de detalhes. O botão de curtir
// fica desabilitado para quem não está logado (canInteract = false) —
// visitantes veem o feed, mas não curtem nem comentam.
export function PostStats({
  likeCount,
  commentCount,
  likedByMe,
  canInteract,
  onToggleLike,
  isTogglingLike = false,
}: PostStatsProps) {
  async function handleShare() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Sem clipboard disponível (ex.: ambiente de teste): ignora.
    }
  }

  return (
    <div className="flex items-center gap-4 text-text-muted">
      <button
        type="button"
        onClick={onToggleLike}
        disabled={!canInteract || isTogglingLike}
        aria-pressed={likedByMe}
        title={canInteract ? (likedByMe ? 'Descurtir' : 'Curtir') : 'Faça login para curtir'}
        className={`flex flex-col items-center gap-1 disabled:cursor-not-allowed disabled:opacity-50 ${
          likedByMe ? 'text-brand' : ''
        }`}
      >
        <CodeIcon />
        <span className="text-sm">{likeCount}</span>
      </button>

      <button
        type="button"
        onClick={handleShare}
        title="Copiar link"
        className="flex flex-col items-center gap-1"
      >
        <ShareIcon />
        <span className="text-sm">Compartilhar</span>
      </button>

      <div className="flex flex-col items-center gap-1">
        <ChatIcon />
        <span className="text-sm">{commentCount}</span>
      </div>
    </div>
  )
}
