import type { InputHTMLAttributes } from 'react'

export function inputClass(error?: string) {
  return `min-h-[38px] w-full rounded-md border bg-white px-2.5 text-[10px] text-ink outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 ${
    error ? 'border-danger bg-danger-subtle' : 'border-line'
  }`
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

export default function Input({
  error,
  className = '',
  ...props
}: InputProps) {
  return <input {...props} className={`${inputClass(error)} ${className}`} />
}
