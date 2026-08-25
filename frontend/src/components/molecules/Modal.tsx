import { IconX } from '@tabler/icons-react'
import { useEffect, type ReactNode } from 'react'

import { Button } from '@/components/atoms/Button'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({ open, title, onClose, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/65 backdrop-blur-sm transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`relative w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden my-8 transition-all duration-150 shadow-[0_20px_40px_-6px_rgba(31,11,16,0.18),inset_0_1px_0_0_rgba(255,255,255,0.95)] dark:shadow-[0_20px_40px_-6px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.12)] ${SIZE_CLASSES[size]}`}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-muted/40">
          <h3 className="text-base font-bold text-text-main tracking-tight m-0">{title}</h3>
          <button
            type="button"
            className="text-text-muted hover:text-text-main p-1.5 rounded-md hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Close"
            onClick={onClose}
          >
            <IconX size={17} />
          </button>
        </div>

        <div className="px-5 py-5 text-text-main overflow-y-auto max-h-[calc(85vh-8rem)]">
          {children}
        </div>

        {footer ? (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-surface-muted/40 border-t border-border">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted leading-relaxed mb-0">{message}</p>
    </Modal>
  )
}
