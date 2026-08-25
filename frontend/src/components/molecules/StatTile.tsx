import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface StatTileProps {
  label: string
  value: string | number
  icon?: ReactNode
  hint?: string
  tone?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'info'
  trend?: { value: number; label?: string }
}

const TONE_CONFIG = {
  primary: {
    icon: 'bg-primary-light text-primary border-primary/20',
    glow: 'from-blue-500/5 to-transparent',
    borderHover: 'hover:border-primary/40',
  },
  secondary: {
    icon: 'bg-secondary-light text-secondary border-secondary/20',
    glow: 'from-purple-500/5 to-transparent',
    borderHover: 'hover:border-secondary/40',
  },
  accent: {
    icon: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-500/20',
    glow: 'from-cyan-500/5 to-transparent',
    borderHover: 'hover:border-accent/40',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20',
    glow: 'from-emerald-500/5 to-transparent',
    borderHover: 'hover:border-emerald-500/40',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-500/20',
    glow: 'from-amber-500/5 to-transparent',
    borderHover: 'hover:border-amber-500/40',
  },
  info: {
    icon: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-500/20',
    glow: 'from-sky-500/5 to-transparent',
    borderHover: 'hover:border-sky-500/40',
  },
}

export function StatTile({ label, value, icon, hint, tone = 'primary', trend }: StatTileProps) {
  const config = TONE_CONFIG[tone] ?? TONE_CONFIG.primary

  return (
    <div
      className={clsx(
        'group relative overflow-hidden bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between gap-3.5',
        config.borderHover,
      )}
    >
      {/* Background subtle gradient */}
      <div
        className={clsx(
          'absolute inset-0 bg-gradient-to-br pointer-events-none opacity-60 transition-opacity group-hover:opacity-100',
          config.glow,
        )}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {icon ? (
          <div
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs',
              config.icon,
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>

      <div className="relative z-10">
        <div className="text-2xl sm:text-3xl font-black text-text-main tabular-nums tracking-tight leading-none">
          {value}
        </div>

        {hint || trend ? (
          <div className="flex items-center gap-2 mt-2 text-xs text-text-muted flex-wrap">
            {trend ? (
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded-md text-[11px]',
                  trend.value >= 0
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                )}
              >
                {trend.value >= 0 ? <IconTrendingUp size={13} /> : <IconTrendingDown size={13} />}
                <span>{trend.value >= 0 ? `+${trend.value}%` : `${trend.value}%`}</span>
              </span>
            ) : null}
            {hint ? <span className="truncate text-text-subtle">{hint}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

