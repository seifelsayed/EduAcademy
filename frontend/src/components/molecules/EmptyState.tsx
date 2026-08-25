import { IconMoodEmpty } from '@tabler/icons-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-10 rounded-lg border border-dashed border-border bg-surface/70 backdrop-blur-md shadow-xs ${className ?? ''}`}
    >
      <div className="w-12 h-12 rounded-md bg-surface-muted border border-border flex items-center justify-center text-text-muted mb-3.5 shadow-xs">
        {icon ?? <IconMoodEmpty size={28} stroke={1.5} />}
      </div>
      <h3 className="text-base font-bold text-text-main mb-1 tracking-tight">{title}</h3>
      {description ? (
        <p className="text-sm text-text-muted max-w-md mb-4 leading-relaxed">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
