import { useMemo } from 'react'

import type { Series } from '@/core/domain/schemas/dashboard'
import { useTranslation } from '@/shared/lib/i18n'

interface SparkChartProps {
  series: Series
  height?: number
  tone?: string
  /** Maps a raw value to its tooltip text (money vs. counts). */
  formatValue?: (value: number) => string
  label: string
}

export function SparkChart({
  series,
  height = 120,
  tone = 'var(--color-primary)',
  formatValue,
  label,
}: SparkChartProps) {
  const { t, formatDate, formatNumber } = useTranslation()

  // Falls back to the locale's numerals rather than String(value).
  const format = formatValue ?? formatNumber

  const { points, area, max, entries } = useMemo(() => {
    const entries = Object.entries(series)
    const values = entries.map(([, value]) => value)
    const max = Math.max(1, ...values)
    const width = 100
    const step = entries.length > 1 ? width / (entries.length - 1) : width

    const coords = entries.map(([, value], index) => {
      const x = index * step
      const y = 100 - (value / max) * 100

      return `${x.toFixed(2)},${y.toFixed(2)}`
    })

    return {
      entries,
      max,
      points: coords.join(' '),
      area: `0,100 ${coords.join(' ')} ${width},100`,
    }
  }, [series])

  if (entries.length === 0) {
    return (
      <p className="text-xs text-text-muted m-0" role="img" aria-label={`${label}: no data`}>
        No data available yet.
      </p>
    )
  }

  return (
    <figure className="m-0 w-full flex flex-col">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ width: '100%', height }}
        role="img"
        aria-label={`${label} — ${t('dash.chartPeak')} ${format(max)}`}
        className="overflow-visible"
      >
        <polygon points={area} fill={tone} fillOpacity="0.12" />
        <polyline
          points={points}
          fill="none"
          stroke={tone}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <figcaption className="flex justify-between text-xs text-text-muted mt-2 pt-1 border-t border-border font-medium">
        <span>{formatDate(entries[0]?.[0], 'd MMM')}</span>
        <span className="font-bold text-text-main">
          {t('dash.chartPeak')} {format(max)}
        </span>
        <span>{formatDate(entries[entries.length - 1]?.[0], 'd MMM')}</span>
      </figcaption>
    </figure>
  )
}
