import clsx from 'clsx'

export type EmptyStateType =
  | 'no-courses'
  | 'no-notifications'
  | 'no-search'
  | 'no-certificates'
  | 'all-completed'
  | 'no-orders'

interface BrandEmptyStateProps {
  type?: EmptyStateType
  size?: number
  className?: string
}

export function BrandEmptyIllustration({
  type = 'no-courses',
  size = 120,
  className = '',
}: BrandEmptyStateProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={clsx('relative inline-flex items-center justify-center select-none', className)}
    >
      {/* Background Soft Glow Aura */}
      <div className="absolute inset-2 bg-gradient-to-tr from-primary/10 via-secondary/10 to-accent/10 rounded-full blur-xl -z-0" />

      {type === 'no-courses' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <rect x="20" y="24" width="56" height="48" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
          <path d="M28 36H68M28 46H58M28 56H48" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="68" cy="58" r="14" fill="#2563EB" />
          <path d="M64 58L67 61L73 54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="18" r="3" fill="#06B6D4" opacity="0.8" />
          <circle cx="78" cy="20" r="2.5" fill="#7C3AED" opacity="0.8" />
        </svg>
      ) : null}

      {type === 'no-search' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <circle cx="44" cy="44" r="24" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" />
          <path d="M61 61L78 78" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="44" cy="44" r="14" fill="rgba(6,182,212,0.12)" />
          <path d="M40 40C40 37.79 41.79 36 44 36C46.21 36 48 37.79 48 40C48 42 46 43 44 45V46.5M44 51H44.01" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      ) : null}

      {type === 'no-certificates' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <rect x="18" y="16" width="60" height="52" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="24" y="22" width="48" height="40" rx="4" fill="rgba(37,99,235,0.04)" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="48" cy="42" r="12" fill="#7C3AED" />
          <path d="M48 36V48M42 42H54" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 66L45 78L48 74L51 78L54 66" fill="#06B6D4" />
        </svg>
      ) : null}

      {type === 'no-notifications' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <path d="M48 20C38 20 34 28 34 40C34 50 30 54 26 56H70C66 54 62 50 62 40C62 28 58 20 48 20Z" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
          <circle cx="48" cy="18" r="3" fill="#2563EB" />
          <path d="M42 60C42 63.3 44.7 66 48 66C51.3 66 54 63.3 54 60" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="66" cy="30" r="4" fill="#06B6D4" />
        </svg>
      ) : null}

      {type === 'all-completed' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <path d="M30 26H66V46C66 56 58 64 48 64C38 64 30 56 30 46V26Z" fill="#FFFFFF" stroke="#2563EB" strokeWidth="2.5" />
          <path d="M30 32H20C16.7 32 14 34.7 14 38C14 43 18 47 23 48L30 49M66 32H76C79.3 32 82 34.7 82 38C82 43 78 47 73 48L66 49" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
          <path d="M48 64V76M36 76H60" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="48,34 51,41 58,42 53,47 54,54 48,50 42,54 43,47 38,42 45,41" fill="#F59E0B" />
        </svg>
      ) : null}

      {type === 'no-orders' ? (
        <svg viewBox="0 0 96 96" fill="none" className="w-full h-full relative z-10">
          <path d="M26 18H70V76L62 72L54 76L48 72L42 76L34 72L26 76V18Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <path d="M36 30H60M36 40H54M36 50H46" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="56" cy="54" r="10" fill="#10B981" />
          <path d="M52 54L55 57L60 51" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : null}
    </div>
  )
}
