import { IconChevronRight } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useTranslation } from '@/shared/lib/i18n'

export interface QuickAction {
  label: string
  to: string
  icon: ReactNode
  tone?: 'primary' | 'secondary' | 'accent' | 'success'
}

const TONE_CLASSES: Record<NonNullable<QuickAction['tone']>, { icon: string; border: string; glow: string }> = {
  primary: {
    icon: 'bg-primary-light text-primary border-primary/20',
    border: 'hover:border-primary/40',
    glow: 'from-blue-500/5 to-transparent',
  },
  secondary: {
    icon: 'bg-secondary-light text-secondary border-secondary/20',
    border: 'hover:border-secondary/40',
    glow: 'from-purple-500/5 to-transparent',
  },
  accent: {
    icon: 'bg-cyan-50 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    border: 'hover:border-accent/40',
    glow: 'from-cyan-500/5 to-transparent',
  },
  success: {
    icon: 'bg-emerald-50 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300',
    border: 'hover:border-emerald-500/40',
    glow: 'from-emerald-500/5 to-transparent',
  },
}

/**
 * The key quick actions a user most often wants to perform from a dashboard.
 */
export function QuickActions({ actions }: { actions: QuickAction[] }) {
  const { isAr } = useTranslation()

  if (actions.length === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {actions.map((action) => {
        const toneStyle = TONE_CLASSES[action.tone ?? 'primary']

        return (
          <Link
            key={action.to + action.label}
            to={action.to}
            className={clsx(
              'group relative overflow-hidden flex flex-col justify-between items-start gap-3 rounded-2xl border border-border bg-surface/90 backdrop-blur-md p-4 shadow-xs no-underline transition-all duration-300 hover:shadow-md hover:-translate-y-1',
              toneStyle.border,
            )}
          >
            <div
              className={clsx(
                'absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity',
                toneStyle.glow,
              )}
            />

            <div className="w-full flex items-center justify-between gap-2 relative z-10">
              <span
                className={clsx(
                  'w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-2xs',
                  toneStyle.icon,
                )}
              >
                {action.icon}
              </span>

              <IconChevronRight
                size={16}
                className={clsx(
                  'text-text-subtle opacity-0 group-hover:opacity-100 transition-all shrink-0',
                  isAr ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5',
                )}
              />
            </div>

            <span className="relative z-10 text-xs font-bold text-text-main leading-snug group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

