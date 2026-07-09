import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg bg-input px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/60 outline-none focus:ring-2 focus:ring-brand ${className}`}
      {...props}
    />
  )
}
