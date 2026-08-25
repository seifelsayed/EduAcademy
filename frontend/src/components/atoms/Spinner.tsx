import clsx from 'clsx'

import { useTranslation } from '@/shared/lib/i18n'

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border-[1.5px]',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const { t } = useTranslation()

  return (
    <div
      className={clsx(
        'inline-block rounded-full border-current border-t-transparent animate-spin shrink-0',
        SIZE_CLASSES[size],
        className,
      )}
      role="status"
      aria-label={t('common.loading')}
    >
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  )
}

/**
 * Falls back to the translated "loading" string, so a caller that does not pass
 * a label still reads in the active language.
 */
export function CenteredSpinner({ label }: { label?: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[300px] gap-3 text-text-muted">
      <Spinner size="lg" className="text-primary" />
      <span className="text-sm font-medium">{label ?? t('common.loading')}</span>
    </div>
  )
}
