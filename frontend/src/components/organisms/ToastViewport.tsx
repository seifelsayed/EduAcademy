import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'

import { useToastStore, type ToastKind } from '@/stores/toastStore'

const ICONS: Record<ToastKind, ReactNode> = {
  success: <IconCircleCheck size={18} className="text-teal-600 dark:text-teal-400" />,
  danger: <IconCircleX size={18} className="text-red-600 dark:text-red-400" />,
  warning: <IconAlertTriangle size={18} className="text-secondary" />,
  info: <IconInfoCircle size={18} className="text-blue-600 dark:text-blue-400" />,
}

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-5 end-5 ltr:right-5 rtl:left-5 rtl:right-auto z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-surface/95 backdrop-blur-xl border border-border rounded-md shadow-lg shadow-[0_10px_25px_-5px_rgba(31,11,16,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)] dark:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)] p-3.5 flex items-start gap-3 transition-all duration-150"
          role="status"
        >
          <span className="shrink-0 mt-0.5">{ICONS[toast.kind]}</span>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs sm:text-sm text-text-main">{toast.title}</div>
            {toast.body ? <p className="text-xs text-text-muted mt-0.5 mb-0">{toast.body}</p> : null}
          </div>

          <button
            type="button"
            className="p-1 rounded text-text-muted hover:text-text-main hover:bg-surface-muted transition-colors cursor-pointer shrink-0"
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <IconX size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}
