type SpinnerProps = {
  /** Texto para lectores de pantalla. Sin `label`, el spinner es decorativo. */
  label?: string
  className?: string
}

export default function Spinner({ label, className = 'size-4' }: SpinnerProps) {
  return (
    <span
      className="inline-flex"
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      <svg
        className={`animate-spin ${className}`}
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}
