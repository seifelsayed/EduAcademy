import clsx from 'clsx'
import type { ReactNode } from 'react'

export type HighlightVariant =
  | 'wavy' // Variation A: Smooth Wavy Line
  | 'organic' // Variation B: Organic Clean Line
  | 'double-wavy' // Variation C: Double Wavy Line
  | 'brush-curve' // Variation D: Curved stroke with tapered brush end
  | 'marker-highlight' // Variation E: Minimal marker highlight stroke

export type HighlightColor = 'primary' | 'secondary' | 'accent' | 'emerald' | 'amber'

interface HighlightedTextProps {
  children: ReactNode
  variant?: HighlightVariant
  color?: HighlightColor
  className?: string
  textClassName?: string
}

const COLOR_HEX: Record<HighlightColor, { stroke: string; fill: string; textGradient: string }> = {
  primary: {
    stroke: '#2563EB',
    fill: 'rgba(37, 99, 235, 0.15)',
    textGradient: 'from-blue-600 to-primary',
  },
  secondary: {
    stroke: '#7C3AED',
    fill: 'rgba(124, 58, 237, 0.15)',
    textGradient: 'from-secondary to-purple-700',
  },
  accent: {
    stroke: '#06B6D4',
    fill: 'rgba(6, 182, 212, 0.15)',
    textGradient: 'from-cyan-600 to-cyan-500',
  },
  emerald: {
    stroke: '#10B981',
    fill: 'rgba(16, 185, 129, 0.15)',
    textGradient: 'from-emerald-600 to-emerald-500',
  },
  amber: {
    stroke: '#F59E0B',
    fill: 'rgba(245, 158, 11, 0.15)',
    textGradient: 'from-amber-600 to-amber-500',
  },
}

export function HighlightedText({
  children,
  variant = 'wavy',
  color = 'primary',
  className = '',
  textClassName = '',
}: HighlightedTextProps) {
  const colorTokens = COLOR_HEX[color]

  return (
    <span className={clsx('relative inline-block whitespace-nowrap', className)}>
      {/* 1. Marker Highlight: Positioned behind the text */}
      {variant === 'marker-highlight' ? (
        <span
          className="absolute inset-x-0 bottom-1 h-3 -rotate-1 rounded-sm -z-0 pointer-events-none transition-all duration-300"
          style={{ backgroundColor: colorTokens.fill }}
          aria-hidden="true"
        />
      ) : null}

      {/* Actual Text Content */}
      <span className={clsx('relative z-10', textClassName)}>
        {children}
      </span>

      {/* 2. Vector Underline SVG Decorations (Below baseline, RTL optimized) */}
      {variant === 'wavy' ? (
        <svg
          className="absolute left-0 right-0 -bottom-2 w-full h-2.5 overflow-visible pointer-events-none"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 7C14 1 26 12 38 6C50 0 62 11 74 6C86 1 94 8 98 6"
            stroke={colorTokens.stroke}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {variant === 'organic' ? (
        <svg
          className="absolute left-0 right-0 -bottom-2 w-full h-2 overflow-visible pointer-events-none"
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 5C25 3.5 50 6.5 75 4C83 3.2 92 4.5 97 4"
            stroke={colorTokens.stroke}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {variant === 'double-wavy' ? (
        <svg
          className="absolute left-0 right-0 -bottom-3 w-full h-3.5 overflow-visible pointer-events-none"
          viewBox="0 0 100 14"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 5C14 1 26 9 38 5C50 1 62 8 74 5C86 2 94 7 98 5"
            stroke={colorTokens.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M4 10C16 6 28 13 40 9C52 5 64 12 76 9C88 6 95 11 98 10"
            stroke={colorTokens.stroke}
            strokeWidth="2"
            strokeOpacity="0.75"
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {variant === 'brush-curve' ? (
        <svg
          className="absolute left-0 right-0 -bottom-2.5 w-full h-3 overflow-visible pointer-events-none"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 3C28 8 70 8 98 3"
            stroke={colorTokens.stroke}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="97" cy="3" r="1.5" fill={colorTokens.stroke} />
        </svg>
      ) : null}
    </span>
  )
}
