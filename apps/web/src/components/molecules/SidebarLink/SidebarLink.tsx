import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface SidebarLinkProps {
  to: string
  icon: ReactNode
  label: string
  onClick?: () => void
}

export function SidebarLink({ to, icon, label, onClick }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex w-full flex-col items-center gap-2 px-4 py-2 text-center no-underline ${
          isActive ? 'text-text' : 'text-text-muted'
        }`
      }
    >
      {icon}
      <span className="text-xl">{label}</span>
    </NavLink>
  )
}
