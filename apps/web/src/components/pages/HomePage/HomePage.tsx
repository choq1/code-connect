import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../atoms/Button/Button'
import { type AuthUser, getMe, logout } from '../../../services/auth'

export function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser>()

  useEffect(() => {
    let isMounted = true

    getMe()
      .then((data) => {
        if (isMounted) {
          setUser(data)
        }
      })
      .catch(() => {
        if (isMounted) {
          logout()
          navigate('/login', { replace: true })
        }
      })

    return () => {
      isMounted = false
    }
  }, [navigate])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-4 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-text">Bem-vindo(a)!</h1>
        {user ? (
          <p className="mt-2 text-lg text-text-muted">
            {user.name} · {user.email}
          </p>
        ) : (
          <p className="mt-2 text-lg text-text-muted">Carregando...</p>
        )}
      </div>

      <Button fullWidth={false} className="px-8" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  )
}
