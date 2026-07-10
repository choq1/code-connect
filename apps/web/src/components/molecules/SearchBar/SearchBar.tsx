import { useEffect, useState } from 'react'
import { SearchIcon } from '../../atoms/icons/Icons'
import { Input } from '../../atoms/Input/Input'

interface SearchBarProps {
  value: string
  onSearch: (value: string) => void
  debounceMs?: number
}

// Busca full-text: o texto digitado aqui é enviado como ?search= para a
// API (GET /posts), que faz o full-text search no Postgres. O debounce
// evita disparar uma requisição a cada tecla.
export function SearchBar({ value, onSearch, debounceMs = 400 }: SearchBarProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (draft !== value) {
        onSearch(draft)
      }
    }, debounceMs)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  return (
    <div className="flex items-center gap-4 rounded bg-card px-4 py-2 text-text-muted">
      <SearchIcon />
      <Input
        type="search"
        aria-label="Buscar posts"
        placeholder="Digite o que você procura"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="bg-transparent p-0 text-lg text-text placeholder:text-text-muted focus:ring-0"
      />
    </div>
  )
}
