import clsx from 'clsx'
import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeTone =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  pill?: boolean
  soft?: boolean
  icon?: ReactNode
}

const TONE_CLASSES: Record<BadgeTone, { soft: string; solid: string }> = {
  primary: {
    soft: 'bg-blue-100/80 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200 border-blue-300/80 dark:border-blue-800 font-bold',
    solid: 'bg-primary text-white border-primary/40 font-bold',
  },
  secondary: {
    soft: 'bg-purple-100/80 text-purple-800 dark:bg-purple-950/70 dark:text-purple-200 border-purple-300/80 dark:border-purple-800 font-bold',
    solid: 'bg-secondary text-white border-secondary/40 font-bold',
  },
  accent: {
    soft: 'bg-cyan-100/80 text-cyan-900 dark:bg-cyan-950/70 dark:text-cyan-200 border-cyan-300/80 dark:border-cyan-800 font-bold',
    solid: 'bg-accent text-slate-900 border-accent/40 font-bold',
  },
  success: {
    soft: 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 font-bold',
    solid: 'bg-emerald-600 text-white border-emerald-700 font-bold',
  },
  warning: {
    soft: 'bg-amber-100/90 text-amber-950 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold',
    solid: 'bg-amber-500 text-white border-amber-600 font-bold',
  },
  danger: {
    soft: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-100 border-rose-300 dark:border-rose-800 font-extrabold',
    solid: 'bg-rose-600 text-white border-rose-700 font-extrabold',
  },
  info: {
    soft: 'bg-sky-100/80 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border-sky-300/80 dark:border-sky-800 font-bold',
    solid: 'bg-sky-600 text-white border-sky-700 font-bold',
  },
  muted: {
    soft: 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 border-slate-300 dark:border-slate-700 font-bold',
    solid: 'bg-slate-600 text-white border-slate-700 font-bold',
  },
}

export function Badge({
  tone = 'muted',
  pill = true,
  soft = true,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const styles = TONE_CLASSES[tone] ?? TONE_CLASSES.muted
  const toneClass = soft ? styles.soft : styles.solid

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold border tracking-wide select-none shadow-2xs',
        pill ? 'rounded-full' : 'rounded-xl',
        toneClass,
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0 flex items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </span>
  )
}
