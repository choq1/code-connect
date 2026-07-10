import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full rounded-lg bg-input px-4 py-3 text-sm text-brand-dark placeholder:text-brand-dark/60 outline-none focus:ring-2 focus:ring-brand ${className}`}
      {...props}
    />
  )
}
