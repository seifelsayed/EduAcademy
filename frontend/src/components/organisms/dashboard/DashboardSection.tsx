import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useTranslation } from '@/shared/lib/i18n'

interface DashboardSectionProps {
  title: string
  description?: string
  /** Optional "view all" style link shown in the header. */
  action?: { label: string; to: string }
  children: ReactNode
}

/**
 * One consistent header treatment for every dashboard block, ensuring
 * visual rhythm and hierarchy across all dashboards.
 */
export function DashboardSection({ title, description, action, children }: DashboardSectionProps) {
  const { isAr } = useTranslation()

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4.5 rounded-full bg-primary" />
            <h2 className="font-heading text-base sm:text-lg font-black text-text-main tracking-tight m-0">
              {title}
            </h2>
          </div>

          {description ? (
            <p className="text-xs text-text-muted mt-1 mb-0 leading-relaxed ps-3.5">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <Link
            to={action.to}
            className="group text-xs font-bold text-primary hover:text-primary-hover no-underline inline-flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-xl bg-primary-light border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-2xs cursor-pointer"
          >
            <span>{action.label}</span>
            {isAr ? (
              <IconArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            ) : (
              <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            )}
          </Link>
        ) : null}
      </div>

      <div>{children}</div>
    </section>
  )
}

