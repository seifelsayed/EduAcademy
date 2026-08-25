import { IconChevronRight, IconHome } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useTranslation } from '@/shared/lib/i18n'

interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: string
  pretitle?: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: Crumb[]
}

export function PageHeader({
  title,
  pretitle,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  const { isAr } = useTranslation()

  return (
    <div className="w-full mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-2.5">
          <ol className="flex items-center gap-1.5 text-xs font-semibold text-text-muted p-0 m-0 list-none flex-wrap">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              const isFirst = index === 0

              return (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-primary transition-colors no-underline text-text-muted inline-flex items-center gap-1"
                    >
                      {isFirst ? <IconHome size={13} className="shrink-0 text-text-subtle" /> : null}
                      <span>{crumb.label}</span>
                    </Link>
                  ) : (
                    <span className={clsx(isLast ? 'text-text-main font-bold' : 'text-text-muted')}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast ? (
                    <IconChevronRight
                      size={12}
                      className={clsx('text-text-subtle shrink-0', isAr ? 'rotate-180' : '')}
                    />
                  ) : null}
                </li>
              )
            })}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {pretitle ? (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-light text-primary border border-primary/20 text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-1.5 shadow-2xs">
              <span>{pretitle}</span>
            </div>
          ) : null}

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-text-main tracking-tight m-0 leading-tight">
            {title}
          </h1>

          {description ? (
            <p className="text-xs sm:text-sm text-text-muted mt-1.5 mb-0 max-w-3xl leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex items-center gap-2.5 shrink-0 sm:self-center flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

