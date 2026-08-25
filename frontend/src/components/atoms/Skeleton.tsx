import clsx from 'clsx'

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  rounded?: boolean
}

export function Skeleton({ width = '100%', height = '1rem', className, rounded }: SkeletonProps) {
  return (
    <span
      className={clsx(
        'block bg-surface-muted/90 animate-pulse border border-border/40',
        rounded ? 'rounded-md' : 'rounded-[4px]',
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

/** A few stacked lines, for paragraph-shaped placeholders. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('flex flex-col gap-2', className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} width={index === lines - 1 ? '60%' : '100%'} height="0.75rem" />
      ))}
    </div>
  )
}
