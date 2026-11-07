import type { TextareaHTMLAttributes } from 'react'
import { inputClass } from './Input'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
}

export default function TextArea({
  error,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`${inputClass(error)} min-h-[88px] resize-y py-2 leading-4 ${className}`}
    />
  )
}
