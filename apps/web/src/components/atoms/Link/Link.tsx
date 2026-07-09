import type { ReactNode } from 'react'
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom'

interface LinkProps extends Omit<RouterLinkProps, 'children'> {
  children: ReactNode
}

export function Link({ children, className = '', ...props }: LinkProps) {
  return (
    <RouterLink className={`underline underline-offset-2 hover:opacity-80 ${className}`} {...props}>
      {children}
    </RouterLink>
  )
}
