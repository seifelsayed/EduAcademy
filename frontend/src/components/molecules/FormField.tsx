import clsx from 'clsx'
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'

import { localizeErrorMessage } from '@/shared/lib/i18n'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactElement<{ id?: string }> | ((id: string) => ReactNode)
}

export function FormField({ label, error, hint, required, className, children }: FormFieldProps) {
  const id = useId()

  const control =
    typeof children === 'function'
      ? children(id)
      : isValidElement(children)
        ? cloneElement(children, { id })
        : children

  const displayError = error ? localizeErrorMessage(error) : undefined

  return (
    <div className={clsx('flex flex-col mb-4', className)}>
      <label className="block text-sm font-semibold text-text-main mb-1.5" htmlFor={id}>
        {label}
        {required ? <span className="text-danger ml-1">*</span> : null}
      </label>

      {control}

      {hint && !displayError ? <p className="text-xs text-text-muted mt-1.5">{hint}</p> : null}
      {displayError ? (
        <p className="text-xs font-medium text-danger mt-1.5" role="alert">
          {displayError}
        </p>
      ) : null}
    </div>
  )
}

