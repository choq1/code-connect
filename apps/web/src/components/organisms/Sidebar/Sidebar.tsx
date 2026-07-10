import { useNavigate } from 'react-router-dom'
import { getToken, logout } from '../../../services/auth'
import {
  FeedIcon,
  InfoIcon,
  LoginIcon,
  LogoutIcon,
  ProfileIcon,
} from '../../atoms/icons/Icons'
import { Link } from '../../atoms/Link/Link'
import { SidebarLink } from '../../molecules/SidebarLink/SidebarLink'

export function Sidebar() {
  const navigate = useNavigate()
  const isLoggedIn = Boolean(getToken())

  function handleLogout() {
    logout()
    navigate('/feed')
  }

  return (
    <aside className="flex w-[177px] shrink-0 flex-col items-center gap-20 self-stretch rounded-lg bg-card px-4 py-10">
      <Link to="/feed" className="no-underline">
        <span className="text-2xl font-semibold text-text">
          code<span className="text-brand">connect</span>
        </span>
      </Link>

      <nav className="flex w-full flex-col items-center gap-10">
        <Link
          to="/publicar"
          className="w-full rounded-lg border border-brand px-4 py-3 text-center text-xl text-brand no-underline"
        >
          Publicar
        </Link>

        <SidebarLink to="/feed" icon={<FeedIcon />} label="Feed" />

        <div className="flex w-full flex-col items-center gap-2 px-4 py-2 text-center text-text-muted">
          <ProfileIcon />
          <span className="text-xl">Perfil</span>
        </div>

        <div className="flex w-full flex-col items-center gap-2 px-4 py-2 text-center text-text-muted">
          <InfoIcon />
          <span className="text-xl">Sobre nós</span>
        </div>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full flex-col items-center gap-2 px-4 py-2 text-center text-text-muted"
          >
            <LogoutIcon />
            <span className="text-xl">Sair</span>
          </button>
        ) : (
          <SidebarLink to="/login" icon={<LoginIcon />} label="Login" />
        )}
      </nav>
    </aside>
  )
}
