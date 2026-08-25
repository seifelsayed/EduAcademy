import { IconArrowRight, IconCircleCheck } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useTranslation } from '@/shared/lib/i18n'

export interface AttentionItem {
  id: string
  label: string
  count: number
  to: string
  icon: ReactNode
  tone?: 'danger' | 'warning' | 'info' | 'success'
}

const TONE_CLASSES: Record<NonNullable<AttentionItem['tone']>, { icon: string; border: string; glow: string }> = {
  danger: {
    icon: 'bg-rose-50 text-rose-600 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300',
    border: 'hover:border-rose-500/40',
    glow: 'from-rose-500/5 to-transparent',
  },
  warning: {
    icon: 'bg-amber-50 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300',
    border: 'hover:border-amber-500/40',
    glow: 'from-amber-500/5 to-transparent',
  },
  info: {
    icon: 'bg-sky-50 text-sky-600 border-sky-500/20 dark:bg-sky-950/40 dark:text-sky-300',
    border: 'hover:border-sky-500/40',
    glow: 'from-sky-500/5 to-transparent',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
    border: 'hover:border-emerald-500/40',
    glow: 'from-emerald-500/5 to-transparent',
  },
}

/**
 * The "what needs me right now" strip that opens every dashboard.
 * Items with a zero count are filtered out.
 */
export function AttentionPanel({ items }: { items: AttentionItem[] }) {
  const { t, isAr, formatNumber } = useTranslation()

  const outstanding = items.filter((item) => item.count > 0)

  if (outstanding.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3.5 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center justify-center shrink-0">
          <IconCircleCheck size={18} />
        </div>
        <span className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
          {t('dash.allCaughtUp')}
        </span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
      {outstanding.map((item) => {
        const toneStyle = TONE_CLASSES[item.tone ?? 'warning']

        return (
          <Link
            key={item.id}
            to={item.to}
            className={clsx(
              'group relative overflow-hidden flex items-center gap-3.5 rounded-2xl border border-border bg-surface/90 backdrop-blur-md px-4 py-3.5 shadow-xs no-underline transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
              toneStyle.border,
            )}
          >
            <div
              className={clsx(
                'absolute inset-0 bg-gradient-to-r pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity',
                toneStyle.glow,
              )}
            />

            <span
              className={clsx(
                'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs',
                toneStyle.icon,
              )}
            >
              {item.icon}
            </span>

            <span className="min-w-0 flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className="block text-xl font-black text-text-main tabular-nums leading-none">
                  {formatNumber(item.count)}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <span className="block text-xs font-semibold text-text-muted mt-1 truncate group-hover:text-text-main transition-colors">
                {item.label}
              </span>
            </span>

            <IconArrowRight
              size={16}
              className={clsx(
                'text-text-subtle group-hover:text-primary transition-all shrink-0 group-hover:translate-x-1',
                isAr ? 'rotate-180 group-hover:-translate-x-1' : '',
              )}
            />
          </Link>
        )
      })}
    </div>
  )
}

