import { Link } from 'react-router-dom'
import clsx from 'clsx'

import { useLanguage } from '@/stores/uiStore'

export type LogoVariant = 'auto' | 'light' | 'dark' | 'monochrome'
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

interface LogoProps {
  compact?: boolean
  /** Hides the wordmark below 360px, where the header has no room for it. */
  responsiveText?: boolean
  symbolOnly?: boolean
  variant?: LogoVariant
  size?: LogoSize
  className?: string
  to?: string
}

const SIZE_MAP: Record<LogoSize, { iconSize: number; iconClass: string; textClass: string; subClass: string }> = {
  sm: {
    iconSize: 28,
    iconClass: 'w-7 h-7',
    textClass: 'text-sm font-black',
    subClass: 'text-[9px]',
  },
  md: {
    iconSize: 36,
    iconClass: 'w-9 h-9',
    textClass: 'text-base font-black',
    subClass: 'text-[10px]',
  },
  lg: {
    iconSize: 44,
    iconClass: 'w-11 h-11',
    textClass: 'text-lg font-black',
    subClass: 'text-[11px]',
  },
  xl: {
    iconSize: 56,
    iconClass: 'w-14 h-14',
    textClass: 'text-2xl font-black',
    subClass: 'text-xs',
  },
}

/**
 * Modern Minimal Geometric Brand Mark for Arabic & English EdTech SaaS
 * Combines: Open Digital Portal + Ascending Growth Trajectory + Tech Node
 */
export function BrandSymbol({
  size = 36,
  variant = 'auto',
  className = '',
}: {
  size?: number
  variant?: LogoVariant
  className?: string
}) {
  const isMonochrome = variant === 'monochrome'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('shrink-0 transition-transform duration-300', className)}
      aria-label="EduAcademy Brand Symbol"
    >
      <defs>
        <linearGradient id="brand-grad-primary" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="brand-grad-accent" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Outer rounded geometric container shield */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={isMonochrome ? 'currentColor' : 'url(#brand-grad-primary)'}
        fillOpacity={isMonochrome ? '0.12' : '1'}
      />

      {/* Internal Geometry: Ascending Tech Portal / Dual Wings */}
      {/* Left Wing / Digital Leaf */}
      <path
        d="M13 29C13 20.1634 20.1634 13 29 13V23C29 29.6274 23.6274 35 17 35H13V29Z"
        fill={isMonochrome ? 'currentColor' : 'white'}
        fillOpacity={isMonochrome ? '0.9' : '0.96'}
      />

      {/* Right Wing / Upward Trajectory Arrow & Node */}
      <path
        d="M35 19C35 27.8366 27.8366 35 19 35V25C19 18.3726 24.3726 13 31 13H35V19Z"
        fill={isMonochrome ? 'currentColor' : 'url(#brand-grad-accent)'}
        fillOpacity={isMonochrome ? '0.6' : '0.85'}
      />

      {/* Center Innovation Core Spark / Focus Diamond */}
      <polygon
        points="24,18 28,24 24,30 20,24"
        fill={isMonochrome ? 'currentColor' : '#FFFFFF'}
      />

      {/* Top Floating Growth Dot */}
      <circle
        cx="34"
        cy="14"
        r="3"
        fill={isMonochrome ? 'currentColor' : '#06B6D4'}
      />
    </svg>
  )
}

export function Logo({
  compact = false,
  responsiveText = false,
  symbolOnly = false,
  variant = 'auto',
  size = 'md',
  className = '',
  to = '/',
}: LogoProps) {
  const config = SIZE_MAP[size]
  const language = useLanguage()
  const isAr = language === 'ar'

  const textThemeClass =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
        ? 'text-slate-900'
        : variant === 'monochrome'
          ? 'text-current'
          : 'text-text-main'

  const subThemeClass =
    variant === 'light'
      ? 'text-slate-300'
      : variant === 'dark'
        ? 'text-slate-500'
        : variant === 'monochrome'
          ? 'text-current opacity-75'
          : 'text-text-muted'

  const content = (
    <div
      className={clsx(
        'inline-flex items-center gap-2.5 no-underline group select-none transition-transform active:scale-98',
        className,
      )}
      aria-label="EduAcademy Brand Logo"
    >
      <div className="relative group-hover:scale-105 transition-transform duration-200">
        <BrandSymbol size={config.iconSize} variant={variant} />
      </div>

      {!compact && !symbolOnly ? (
        <div
          className={clsx(
            'flex-col leading-none min-w-0',
            responsiveText ? 'hidden min-[360px]:flex' : 'flex',
            isAr ? 'text-right' : 'text-left',
          )}
        >
          <div
            className={clsx(
              'tracking-tight transition-colors font-heading whitespace-nowrap',
              config.textClass,
              textThemeClass,
            )}
          >
            {isAr ? (
              <>
                منصة{' '}
                <span
                  className={clsx(
                    variant === 'monochrome'
                      ? 'underline decoration-2'
                      : 'bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent',
                  )}
                >
                  تعليم
                </span>
              </>
            ) : (
              <>
                Edu
                <span
                  className={clsx(
                    variant === 'monochrome'
                      ? 'underline decoration-2'
                      : 'bg-gradient-to-r from-primary via-blue-600 to-secondary bg-clip-text text-transparent',
                  )}
                >
                  Academy
                </span>
              </>
            )}
          </div>
          <span
            className={clsx(
              'font-extrabold uppercase tracking-widest mt-1 whitespace-nowrap',
              config.subClass,
              subThemeClass,
            )}
          >
            {isAr ? 'التعليم الذكي' : 'Online Learning'}
          </span>
        </div>
      ) : null}
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="no-underline inline-block">
        {content}
      </Link>
    )
  }

  return content
}
