import type { SelectHTMLAttributes } from 'react'
import { inputClass } from './Input'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string
}

export default function Select({
  error,
  className = '',
  ...props
}: SelectProps) {
  return <select {...props} className={`${inputClass(error)} ${className}`} />
}
