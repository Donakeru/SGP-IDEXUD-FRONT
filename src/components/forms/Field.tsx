import type { ReactNode } from 'react'

type FieldProps = {
  label: string
  required?: boolean
  optional?: string
  error?: string
  help?: string
  children: ReactNode
  wide?: boolean
}

export default function Field({
  label,
  required,
  optional,
  error,
  help,
  children,
  wide = false,
}: FieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? 'md:col-span-2' : ''}`}>
      <span className="flex items-center gap-2 text-[10px] font-semibold text-ink">
        {label}
        {required && <strong className="text-danger">*</strong>}
        {optional && (
          <em className="font-normal not-italic text-muted">{optional}</em>
        )}
      </span>
      {children}
      {(error || help) && (
        <small className={`text-[8px] leading-3 ${error ? 'text-danger' : 'text-muted'}`}>
          {error ?? help}
        </small>
      )}
    </label>
  )
}
