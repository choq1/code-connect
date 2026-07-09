import type { ReactNode } from 'react'

interface DividerProps {
  children: ReactNode
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-text-muted">
      <span className="h-px flex-1 bg-text-muted/40" />
      {children}
      <span className="h-px flex-1 bg-text-muted/40" />
    </div>
  )
}
