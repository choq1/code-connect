import type { ButtonHTMLAttributes } from 'react'

interface TagProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function Tag({ label, className = '', ...props }: TagProps) {
  return (
    <button
      type="button"
      className={`rounded bg-text-muted px-2 py-1 text-sm text-brand-dark ${className}`}
      {...props}
    >
      {label}
    </button>
  )
}
