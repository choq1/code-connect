import type { ButtonHTMLAttributes } from 'react'

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
}

export function SocialButton({ icon, label, className = '', ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-2 text-xs text-text hover:opacity-80 ${className}`}
      {...props}
    >
      <img src={icon} alt="" className="h-8 w-auto" />
      {label}
    </button>
  )
}
