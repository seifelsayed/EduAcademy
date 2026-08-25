import clsx from 'clsx'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { Spinner } from '@/components/atoms/Spinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary-hover hover:to-blue-700 shadow-sm hover:shadow-md hover:shadow-primary/25 border border-primary/20',
  secondary:
    'bg-gradient-to-r from-secondary to-purple-600 text-white hover:from-secondary-hover hover:to-purple-700 shadow-sm hover:shadow-md hover:shadow-secondary/25 border border-secondary/20',
  accent:
    'bg-accent hover:bg-accent-hover text-slate-950 font-bold shadow-sm hover:shadow-md hover:shadow-accent/25 border border-accent/30',
  outline:
    'border border-border bg-surface hover:bg-surface-hover text-text-main hover:border-border-hover shadow-xs',
  ghost:
    'border border-transparent bg-transparent hover:bg-surface-muted text-text-muted hover:text-text-main',
  danger:
    'bg-danger hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:shadow-danger/25 border border-danger/20',
  success:
    'bg-success hover:bg-emerald-600 text-white shadow-sm hover:shadow-md hover:shadow-success/25 border border-success/20',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-bold',
  md: 'h-10 px-4 py-2 text-sm gap-2 rounded-xl font-bold',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl font-bold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconRight,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={clsx(
        'inline-flex items-center justify-center font-bold select-none cursor-pointer',
        'transition-all duration-150 ease-out hover:scale-[1.015] active:scale-[0.98]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size} />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}

      {children ? <span className="truncate">{children}</span> : null}

      {!loading && iconRight ? (
        <span className="shrink-0 flex items-center">{iconRight}</span>
      ) : null}
    </button>
  )
})
