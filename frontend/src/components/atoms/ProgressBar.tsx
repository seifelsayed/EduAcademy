import clsx from 'clsx'

export interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
}

const HEIGHT_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
}

const TONE_CLASSES = {
  primary: 'bg-gradient-to-r from-primary to-blue-500',
  secondary: 'bg-gradient-to-r from-secondary to-purple-500',
  accent: 'bg-gradient-to-r from-cyan-500 to-primary',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  warning: 'bg-gradient-to-r from-amber-500 to-yellow-400',
  danger: 'bg-gradient-to-r from-rose-500 to-red-400',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  size = 'md',
  tone = 'primary',
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={clsx('w-full flex flex-col gap-1', className)}>
      {label ? (
        <div className="flex justify-between text-xs font-semibold text-text-muted">
          <span>{label}</span>
          <span className="tabular-nums font-mono">{Math.round(percent)}%</span>
        </div>
      ) : null}

      <div
        className={clsx(
          'w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border/50',
          HEIGHT_CLASSES[size],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out shadow-xs', TONE_CLASSES[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
