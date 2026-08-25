import clsx from 'clsx'
import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

export { Checkbox, type CheckboxProps } from './Checkbox'
export { Select, type SelectProps } from './Select'

interface WithValidity {
  invalid?: boolean
}

const BASE_INPUT_CLASSES =
  'w-full bg-surface/90 backdrop-blur-md text-text-main placeholder:text-text-subtle border border-border rounded-md px-3.5 py-2 text-sm shadow-xs transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-border-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted'

const INVALID_CLASSES = 'border-danger focus:border-danger focus:ring-danger/20'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & WithValidity
>(function Input({ invalid, className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(BASE_INPUT_CLASSES, invalid && INVALID_CLASSES, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & WithValidity
>(function Textarea({ invalid, className, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        BASE_INPUT_CLASSES,
        'resize-y min-h-[5rem]',
        invalid && INVALID_CLASSES,
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
})

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  hint?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hint, className, disabled, ...rest },
  ref,
) {
  return (
    <label
      className={clsx(
        'group flex items-center justify-between gap-3 cursor-pointer text-sm select-none',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="font-medium text-text-main group-hover:text-primary transition-colors">{label}</span>
        {hint ? <span className="text-xs text-text-muted mt-0.5">{hint}</span> : null}
      </div>
      <div className="relative inline-flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="sr-only peer"
          {...rest}
        />
        <div className="w-9 h-5 bg-surface-muted border border-border rounded-md peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-white after:border-border after:border after:rounded-[3px] after:h-4 after:w-4 after:transition-all after:shadow-xs peer-checked:bg-primary peer-checked:border-primary transition-all duration-150" />
      </div>
    </label>
  )
})
