import { useState } from 'react'
import { CodeIcon } from '../../atoms/icons/Icons'

interface PostThumbnailProps {
  thumbnailUrl: string | null
  title: string
  className?: string
}

// Alguns posts não têm thumbnail (ou a imagem falha ao carregar). Nesses
// casos, exibimos um placeholder determinístico — um degradê derivado do
// título com o glifo "</>" — em vez de deixar um espaço vazio ou quebrado.
export function PostThumbnail({ thumbnailUrl, title, className = '' }: PostThumbnailProps) {
  const [failed, setFailed] = useState(false)
  const showPlaceholder = !thumbnailUrl || failed

  if (showPlaceholder) {
    const hue = hashToHue(title)

    return (
      <div
        role="img"
        aria-label={`Sem thumbnail para o post "${title}"`}
        className={`flex items-center justify-center rounded-lg ${className}`}
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 45% 22%), hsl(${hue} 45% 12%))`,
        }}
      >
        <CodeIcon className="size-12 text-text-muted" />
      </div>
    )
  }

  return (
    <img
      src={thumbnailUrl}
      alt={`Thumbnail do post "${title}"`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`rounded-lg object-cover ${className}`}
    />
  )
}

function hashToHue(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 360
  }
  return hash
}
