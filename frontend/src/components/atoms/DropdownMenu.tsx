import clsx from 'clsx'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'

interface DropdownContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

function useDropdown() {
  const context = useContext(DropdownContext)
  if (!context) {
    throw new Error('Dropdown sub-components must be used within a <DropdownMenu>')
  }
  return context
}

export interface DropdownMenuProps {
  children: ReactNode
  className?: string
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggle = () => setOpen((prev) => !prev)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen, toggle }}>
      <div ref={containerRef} className={clsx('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: ReactNode
}

export function DropdownMenuTrigger({
  children,
  className,
  type = 'button',
  ...rest
}: DropdownMenuTriggerProps) {
  const { open, toggle } = useDropdown()

  return (
    <button
      type={type}
      aria-expanded={open}
      aria-haspopup="menu"
      onClick={toggle}
      className={clsx('cursor-pointer focus:outline-none', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right'
  width?: 'sm' | 'md' | 'lg' | 'auto'
  children: ReactNode
}

const WIDTH_CLASSES = {
  sm: 'w-48',
  md: 'w-60',
  lg: 'w-72',
  auto: 'w-auto min-w-[12rem]',
}

export function DropdownMenuContent({
  align = 'right',
  width = 'md',
  children,
  className,
  ...rest
}: DropdownMenuContentProps) {
  const { open } = useDropdown()

  if (!open) return null

  return (
    <div
      role="menu"
      className={clsx(
        'absolute z-50 mt-2 py-1.5 rounded-lg border border-border transition-all duration-150',
        'bg-surface/95 backdrop-blur-xl shadow-lg',
        'shadow-[0_12px_28px_-4px_rgba(31,11,16,0.12),inset_0_1px_0_0_rgba(255,255,255,0.9)]',
        'dark:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)]',
        align === 'right' ? 'right-0' : 'left-0',
        WIDTH_CLASSES[width],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  children: ReactNode
}

export function DropdownMenuItem({
  icon,
  children,
  className,
  onClick,
  type = 'button',
  ...rest
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false)
    onClick?.(e)
  }

  return (
    <button
      type={type}
      role="menuitem"
      onClick={handleClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-text-main text-left',
        'hover:bg-surface-hover/80 hover:text-primary transition-colors cursor-pointer',
        'focus:outline-none focus:bg-surface-hover/80 focus:text-primary',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="text-text-muted shrink-0 flex items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </button>
  )
}

export interface DropdownMenuLinkProps extends LinkProps {
  icon?: ReactNode
  children: ReactNode
}

export function DropdownMenuLink({
  icon,
  children,
  className,
  onClick,
  ...rest
}: DropdownMenuLinkProps) {
  const { setOpen } = useDropdown()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setOpen(false)
    onClick?.(e)
  }

  return (
    <Link
      role="menuitem"
      onClick={handleClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-text-main text-left no-underline',
        'hover:bg-surface-hover/80 hover:text-primary transition-colors cursor-pointer',
        'focus:outline-none focus:bg-surface-hover/80 focus:text-primary',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="text-text-muted shrink-0 flex items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </Link>
  )
}

export function DropdownMenuDangerItem({
  icon,
  children,
  className,
  onClick,
  type = 'button',
  ...rest
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false)
    onClick?.(e)
  }

  return (
    <button
      type={type}
      role="menuitem"
      onClick={handleClick}
      className={clsx(
        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-danger text-left',
        'hover:bg-danger-light/50 transition-colors cursor-pointer',
        'focus:outline-none focus:bg-danger-light/50',
        className,
      )}
      {...rest}
    >
      {icon ? <span className="text-danger shrink-0 flex items-center">{icon}</span> : null}
      <span className="truncate">{children}</span>
    </button>
  )
}

export function DropdownMenuHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={clsx('px-3.5 py-2 border-b border-border/80 text-xs text-text-muted', className)}>
      {children}
    </div>
  )
}

export function DropdownMenuDivider({ className }: { className?: string }) {
  return <div className={clsx('my-1 border-t border-border/80', className)} role="separator" />
}
