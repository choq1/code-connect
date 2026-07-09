import type { AnchorHTMLAttributes, ReactNode } from 'react'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
}

export function Link({ children, className = '', ...props }: LinkProps) {
  return (
    <a className={`underline underline-offset-2 hover:opacity-80 ${className}`} {...props}>
      {children}
    </a>
  )
}
