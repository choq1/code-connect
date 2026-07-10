import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken } from '../../../services/auth'

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const token = getToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
