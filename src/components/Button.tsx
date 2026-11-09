import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode
  variant?: ButtonVariant
  /** Deshabilita el botón, muestra un spinner y marca `aria-busy`. */
  isLoading?: boolean
  /** Texto mostrado mientras `isLoading` es `true`. Por defecto, el mismo contenido. */
  loadingText?: ReactNode
  /** Ícono al inicio. Se reemplaza por el spinner mientras carga. */
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-[0_2px_4px_rgba(255,78,0,0.18)] hover:bg-primary-hover',
  secondary:
    'border border-line bg-white text-body hover:bg-primary-soft hover:text-primary-strong',
  danger:
    'border border-danger-line bg-white text-danger hover:bg-danger-soft',
}

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  icon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? <Spinner /> : icon}
      {isLoading && loadingText !== undefined ? loadingText : children}
    </button>
  )
}
