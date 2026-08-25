import { IconStar, IconStarFilled, IconStarHalfFilled } from '@tabler/icons-react'
import clsx from 'clsx'

import { useTranslation } from '@/shared/lib/i18n'

export interface StarRatingProps {
  value: number
  max?: number
  count?: number
  size?: number
  showValue?: boolean
  className?: string
}

export function StarRating({
  value,
  max = 5,
  count,
  size = 15,
  showValue = true,
  className,
}: StarRatingProps) {
  const { formatNumber, isAr } = useTranslation()
  const rounded = Math.round(value * 2) / 2

  const displayVal = value > 0 ? (isAr ? formatNumber(parseFloat(value.toFixed(1))) : value.toFixed(1)) : (isAr ? '٠٫٠' : '0.0')

  return (
    <div className={clsx('inline-flex items-center gap-1.5 select-none', className)} aria-label={`Rating: ${value} out of ${max}`}>
      <div className="inline-flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: max }, (_, index) => {
          const ratingStep = index + 1

          if (rounded >= ratingStep) {
            return <IconStarFilled key={index} size={size} />
          }

          if (rounded >= ratingStep - 0.5) {
            return <IconStarHalfFilled key={index} size={size} />
          }

          return <IconStar key={index} size={size} className="text-slate-300 dark:text-slate-600" />
        })}
      </div>

      {showValue ? (
        <span className="text-xs font-bold text-text-main tabular-nums">
          {displayVal}
        </span>
      ) : null}

      {count !== undefined ? (
        <span className="text-xs text-text-muted">
          ({formatNumber(count)})
        </span>
      ) : null}
    </div>
  )
}

export interface StarInputProps {
  value: number
  onChange: (value: number) => void
  max?: number
  size?: number
}

export function StarInput({ value, onChange, max = 5, size = 24 }: StarInputProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1
        const active = star <= value

        return (
          <button
            key={star}
            type="button"
            className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            onClick={() => onChange(star)}
            aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
          >
            {active ? <IconStarFilled size={size} /> : <IconStar size={size} className="text-slate-300 dark:text-slate-600" />}
          </button>
        )
      })}
    </div>
  )
}
