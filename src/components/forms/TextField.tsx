import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import Input from './Input'

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  /** Muestra el asterisco de obligatorio. */
  required?: boolean
  /** Texto junto a la etiqueta, por ejemplo "Opcional". */
  optional?: string
  /** Mensaje de error. Marca el campo como inválido y lo asocia al input. */
  error?: string
  help?: string
  /** Contenido (ícono) a la izquierda dentro del campo. */
  leading?: ReactNode
  /** Contenido (botón) a la derecha dentro del campo. */
  trailing?: ReactNode
  id?: string
}

/**
 * Campo de texto con etiqueta visible, ayuda y error asociados mediante
 * `htmlFor`, `aria-invalid` y `aria-describedby`.
 */
export default function TextField({
  label,
  required,
  optional,
  error,
  help,
  leading,
  trailing,
  id,
  className = '',
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error ?? help

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-2 text-[10px] font-semibold text-ink"
        htmlFor={inputId}
      >
        {label}
        {required && (
          <strong className="text-danger" aria-hidden="true">
            *
          </strong>
        )}
        {optional && (
          <em className="font-normal not-italic text-muted">{optional}</em>
        )}
      </label>
      <div className="relative">
        {leading && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            {leading}
          </span>
        )}
        <Input
          {...inputProps}
          id={inputId}
          error={error}
          required={required}
          className={`${leading ? 'pl-9' : ''} ${trailing ? 'pr-9' : ''} ${className}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
        />
        {trailing && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {trailing}
          </span>
        )}
      </div>
      {message && (
        <small
          id={messageId}
          className={`text-[9px] leading-3 ${error ? 'text-danger' : 'text-muted'}`}
        >
          {message}
        </small>
      )}
    </div>
  )
}
