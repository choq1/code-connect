import type { ReactNode } from 'react'
import { Sidebar } from '../../organisms/Sidebar/Sidebar'

interface AppShellProps {
  children: ReactNode
}

// Casca compartilhada entre Feed, Detalhes do post e Publicar: menu lateral
// fixo + área de conteúdo. Mantém a sidebar (com o link Login/Sair
// dependente da sessão) consistente nas três telas.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-bg px-6 py-10 md:px-14">
      <div className="mx-auto flex max-w-6xl items-start gap-10">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
