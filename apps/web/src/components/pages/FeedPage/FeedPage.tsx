import { useEffect, useState } from 'react'
import { listPosts, type PaginatedPosts } from '../../../services/posts'
import { Button } from '../../atoms/Button/Button'
import { SearchBar } from '../../molecules/SearchBar/SearchBar'
import { PostCard } from '../../organisms/PostCard/PostCard'
import { AppShell } from '../../templates/AppShell/AppShell'

export function FeedPage() {
  const [search, setSearch] = useState('')
  const [tag, setTag] = useState<string>()
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedPosts>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setError(undefined)

    listPosts({ search: search || undefined, tag, page })
      .then((result) => {
        if (isMounted) setData(result)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar o feed. Tente novamente.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [search, tag, page])

  function handleSearch(value: string) {
    setPage(1)
    setSearch(value)
  }

  function handleTagClick(clickedTag: string) {
    setPage(1)
    setTag(clickedTag)
  }

  function handleClearTag() {
    setPage(1)
    setTag(undefined)
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <AppShell>
      <div className="flex flex-col gap-14">
        <div className="flex flex-col gap-4">
          <SearchBar value={search} onSearch={handleSearch} />

          {tag && (
            <div className="flex items-center justify-between">
              <p className="text-text-muted">
                Filtrando por: <span className="font-semibold text-text">{tag}</span>
              </p>
              <button
                type="button"
                onClick={handleClearTag}
                className="text-lg text-text-muted underline underline-offset-2 hover:opacity-80"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="border-b-2 border-brand pb-1 text-xl font-semibold text-brand">
            Recentes
          </h2>

          {isLoading && <p className="text-text-muted">Carregando posts...</p>}
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}

          {!isLoading && !error && data?.items.length === 0 && (
            <p className="text-text-muted">Nenhum post encontrado.</p>
          )}

          {!isLoading && !error && data && data.items.length > 0 && (
            <>
              <div className="flex flex-wrap gap-6">
                {data.items.map((post) => (
                  <PostCard key={post.id} post={post} onTagClick={handleTagClick} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    fullWidth={false}
                    className="px-6"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-text-muted">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    fullWidth={false}
                    className="px-6"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
