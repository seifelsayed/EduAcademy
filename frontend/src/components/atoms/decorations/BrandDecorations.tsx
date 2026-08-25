import clsx from 'clsx'

/**
 * 1. Sparkle Icon (4-point luxury star) for titles & key highlights
 */
export function SparkleAccent({
  size = 18,
  color = '#06B6D4',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('inline-block shrink-0 animate-pulse', className)}
      aria-hidden="true"
    >
      <path
        d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z"
        fill={color}
      />
    </svg>
  )
}

/**
 * 2. Star Accent for placing above letters or beside badges
 */
export function StarAccent({
  size = 14,
  color = '#7C3AED',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('inline-block shrink-0', className)}
      aria-hidden="true"
    >
      <polygon
        points="8,1 10.3,5.8 15.5,6.5 11.8,10.1 12.6,15.2 8,12.8 3.4,15.2 4.2,10.1 0.5,6.5 5.7,5.8"
        fill={color}
      />
    </svg>
  )
}

/**
 * 3. Code Brackets Decorator (</> or { })
 */
export function CodeBracketsAccent({
  size = 20,
  color = '#2563EB',
  className = '',
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('inline-block shrink-0', className)}
      aria-hidden="true"
    >
      <path
        d="M7 8L3 12L7 16M17 8L21 12L17 16M14 4L10 20"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 4. Gradient Glowing Ring
 */
export function GradientRing({
  size = 120,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={clsx(
        'rounded-full bg-gradient-to-tr from-primary via-secondary to-accent p-[2px] opacity-70 pointer-events-none',
        className,
      )}
      aria-hidden="true"
    >
      <div className="w-full h-full rounded-full bg-surface" />
    </div>
  )
}

/**
 * 5. Floating Geometric Dots Cluster
 */
export function FloatingDots({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('pointer-events-none opacity-60', className)}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3" fill="#2563EB" />
      <circle cx="24" cy="8" r="2" fill="#7C3AED" />
      <circle cx="40" cy="8" r="3.5" fill="#06B6D4" />
      <circle cx="8" cy="24" r="2.5" fill="#06B6D4" />
      <circle cx="24" cy="24" r="4" fill="#2563EB" />
      <circle cx="40" cy="24" r="2" fill="#7C3AED" />
      <circle cx="8" cy="40" r="3.5" fill="#7C3AED" />
      <circle cx="24" cy="40" r="2.5" fill="#06B6D4" />
      <circle cx="40" cy="40" r="3" fill="#2563EB" />
    </svg>
  )
}

/**
 * 6. Subtle Technical Grid Pattern
 */
export function TechGridPattern({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      className={clsx('w-full h-full pointer-events-none opacity-40', className)}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <pattern id="brand-tech-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-border" />
          <circle cx="32" cy="32" r="1.2" fill="#2563EB" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#brand-tech-grid)" />
    </svg>
  )
}

/**
 * 7. AI & Data Connected Node
 */
export function AiNodeAccent({
  size = 24,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('inline-block shrink-0', className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" fill="#7C3AED" />
      <circle cx="4" cy="6" r="2.5" fill="#06B6D4" />
      <circle cx="20" cy="6" r="2.5" fill="#2563EB" />
      <circle cx="12" cy="20" r="2.5" fill="#06B6D4" />
      <line x1="6" y1="7.5" x2="10" y2="10" stroke="#7C3AED" strokeWidth="1.5" />
      <line x1="18" y1="7.5" x2="14" y2="10" stroke="#2563EB" strokeWidth="1.5" />
      <line x1="12" y1="16" x2="12" y2="17.5" stroke="#06B6D4" strokeWidth="1.5" />
    </svg>
  )
}
