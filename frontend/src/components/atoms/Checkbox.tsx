import clsx from 'clsx'
import { forwardRef, type InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  hint?: string
  invalid?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, invalid, className, disabled, checked, ...rest },
  ref,
) {
  return (
    <label
      className={clsx(
        'group inline-flex items-start gap-2.5 cursor-pointer text-sm select-none',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        className="peer sr-only"
        aria-invalid={invalid || undefined}
        {...rest}
      />

      <span
        aria-hidden="true"
        className={clsx(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150',
          'bg-surface/90 shadow-xs',
          'border-border group-hover:border-border-hover peer-hover:border-primary/50',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/25 peer-focus-visible:border-primary peer-focus-visible:outline-none',
          'text-transparent peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white',
          'peer-checked:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.15)]',
          invalid && 'border-danger peer-focus-visible:ring-danger/25',
        )}
      >
        <svg
          className="h-3 w-3 fill-none stroke-current stroke-[3] transition-colors duration-150"
          viewBox="0 0 24 24"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      {label || hint ? (
        <span className="flex flex-col">
          {label ? (
            <span className="font-medium text-text-main group-hover:text-primary transition-colors leading-tight">
              {label}
            </span>
          ) : null}
          {hint ? (
            <span className="text-xs text-text-muted mt-0.5 leading-normal">{hint}</span>
          ) : null}
        </span>
      ) : null}
    </label>
  )
})
