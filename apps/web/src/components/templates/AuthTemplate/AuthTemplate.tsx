import type { ReactNode } from 'react'

interface AuthTemplateProps {
  bannerSrc: string
  bannerAlt: string
  children: ReactNode
}

export function AuthTemplate({ bannerSrc, bannerAlt, children }: AuthTemplateProps) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-bg p-6">
      <div className="flex w-full max-w-4xl flex-col gap-8 rounded-2xl bg-card p-6 md:flex-row md:gap-10 md:p-8">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          className="hidden w-full max-w-sm rounded-xl object-cover md:block"
        />
        <div className="flex flex-1 flex-col justify-center gap-8">{children}</div>
      </div>
    </main>
  )
}
