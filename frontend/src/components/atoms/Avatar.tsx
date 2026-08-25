import clsx from 'clsx'

import { initials } from '@/shared/lib/format'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  src?: string | null
  size?: AvatarSize
  className?: string
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px] rounded-[4px]',
  sm: 'w-8 h-8 text-xs rounded-md',
  md: 'w-10 h-10 text-sm rounded-md',
  lg: 'w-12 h-12 text-base rounded-lg',
  xl: 'w-16 h-16 text-lg rounded-lg',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx(
          'inline-block object-cover shrink-0 ring-1 ring-border shadow-xs',
          SIZE_CLASSES[size],
          className,
        )}
      />
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center font-bold uppercase shrink-0 select-none bg-primary-light text-primary ring-1 ring-primary/25 shadow-xs',
        SIZE_CLASSES[size],
        className,
      )}
      aria-label={name}
      role="img"
    >
      {initials(name)}
    </span>
  )
}
