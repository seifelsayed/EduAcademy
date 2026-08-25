import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import clsx from 'clsx'

import { useTranslation } from '@/shared/lib/i18n'
import type { PaginationMeta } from '@/core/domain/schemas/common'

interface PaginationProps {
  meta: PaginationMeta
  onChange: (page: number) => void
}

function pageWindow(current: number, last: number): (number | 'gap')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, 'gap', last]
  }

  if (current >= last - 3) {
    return [1, 'gap', last - 4, last - 3, last - 2, last - 1, last]
  }

  return [1, 'gap', current - 1, current, current + 1, 'gap', last]
}

export function Pagination({ meta, onChange }: PaginationProps) {
  const { t, formatNumber } = useTranslation()

  if (meta.last_page <= 1) return null

  const pages = pageWindow(meta.current_page, meta.last_page)

  return (
    <nav aria-label={t('dash.paginationLabel')} className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3">
      <p className="text-xs text-text-muted mb-0">
        {t('dash.paginationSummary', {
          from: formatNumber(meta.from ?? 0),
          to: formatNumber(meta.to ?? 0),
          total: formatNumber(meta.total),
        })}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-8 w-8 rounded-md flex items-center justify-center text-text-main bg-surface/90 hover:bg-surface-hover border border-border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none shadow-xs"
          onClick={() => onChange(meta.current_page - 1)}
          disabled={meta.current_page === 1}
          aria-label={t('dash.previousPage')}
        >
          <IconChevronLeft size={15} />
        </button>

        {pages.map((page, index) =>
          page === 'gap' ? (
            <span key={`gap-${index}`} className="h-8 w-8 flex items-center justify-center text-text-subtle text-xs select-none">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={clsx(
                'h-8 min-w-8 px-2.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                page === meta.current_page
                  ? 'bg-primary text-white border border-primary/90 shadow-[0_2px_4px_rgba(31,11,16,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] pointer-events-none'
                  : 'bg-surface/90 text-text-main hover:bg-surface-hover border border-border shadow-xs',
              )}
              onClick={() => onChange(page)}
              aria-current={page === meta.current_page ? 'page' : undefined}
            >
              {formatNumber(page)}
            </button>
          ),
        )}

        <button
          type="button"
          className="h-8 w-8 rounded-md flex items-center justify-center text-text-main bg-surface/90 hover:bg-surface-hover border border-border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none shadow-xs"
          onClick={() => onChange(meta.current_page + 1)}
          disabled={meta.current_page === meta.last_page}
          aria-label={t('dash.nextPage')}
        >
          <IconChevronRight size={15} />
        </button>
      </div>
    </nav>
  )
}
