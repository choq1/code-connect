import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** @default true */
  fullWidth?: boolean
}

export function Button({ children, className = '', fullWidth = true, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-lg font-semibold text-brand-dark transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
