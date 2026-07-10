import { useState, type FormEvent } from 'react'
import { Button } from '../../atoms/Button/Button'
import { Link } from '../../atoms/Link/Link'
import { Textarea } from '../../atoms/Textarea/Textarea'

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>
  canInteract: boolean
  placeholder?: string
  submitLabel?: string
}

// Usado tanto para o comentário principal do post quanto para respostas
// (via CommentItem). Visitantes não logados veem um convite para login em
// vez do formulário — comentar exige sessão.
export function CommentForm({
  onSubmit,
  canInteract,
  placeholder = 'Escreva um comentário...',
  submitLabel = 'Comentar',
}: CommentFormProps) {
  const [body, setBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!canInteract) {
    return (
      <p className="text-sm text-text-muted">
        <Link to="/login">Faça login</Link> para comentar.
      </p>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return

    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setBody('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        aria-label={placeholder}
        placeholder={placeholder}
        rows={3}
        value={body}
        onChange={(event) => setBody(event.target.value)}
      />
      <Button
        type="submit"
        disabled={isSubmitting || !body.trim()}
        fullWidth={false}
        className="self-end px-6"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
