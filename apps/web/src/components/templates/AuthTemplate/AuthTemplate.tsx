import type { ReactNode } from 'react'

interface AuthTemplateProps {
  bannerSrc: string
  bannerAlt: string
  bannerWidth: number
  bannerHeight: number
  children: ReactNode
}

export function AuthTemplate({
  bannerSrc,
  bannerAlt,
  bannerWidth,
  bannerHeight,
  children,
}: AuthTemplateProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-bg p-6">
      <img
        src="/auth-decor-top.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-[7%] hidden w-[300px] sm:block"
      />
      <img
        src="/auth-decor-bottom.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 right-[7%] hidden w-[300px] sm:block"
      />

      <div className="relative flex w-full max-w-4xl flex-col gap-8 rounded-2xl bg-card p-6 md:flex-row md:gap-10 md:p-8">
        <img
          src={bannerSrc}
          alt={bannerAlt}
          width={bannerWidth}
          height={bannerHeight}
          fetchPriority="high"
          decoding="async"
          className="hidden w-full max-w-sm rounded-xl object-cover md:block"
        />
        <div className="flex flex-1 flex-col justify-center gap-8">{children}</div>
      </div>
    </main>
  )
}
