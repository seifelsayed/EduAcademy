import { create } from 'zustand'

import { apiErrorMessage } from '@/shared/lib/i18n/apiErrorMessage'
import { localizeErrorMessage } from '@/shared/lib/i18n'

export type ToastKind = 'success' | 'danger' | 'warning' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  body?: string
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
  clear: () => void
}

/** Toasts auto-dismiss; errors linger a little longer so they can be read. */
const LIFETIMES: Record<ToastKind, number> = {
  success: 3500,
  info: 4000,
  warning: 5000,
  danger: 6000,
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  push: (toast) => {
    const id = crypto.randomUUID()

    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))

    window.setTimeout(() => get().dismiss(id), LIFETIMES[toast.kind])

    return id
  },

  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clear: () => set({ toasts: [] }),
}))

/* ------------------------------------------------------ Imperative helpers */

export const toast = {
  success: (title: string, body?: string) =>
    useToastStore.getState().push({
      kind: 'success',
      title: localizeErrorMessage(title),
      body: body ? localizeErrorMessage(body) : undefined,
    }),

  error: (title: string, body?: string) =>
    useToastStore.getState().push({
      kind: 'danger',
      title: localizeErrorMessage(title),
      body: body ? localizeErrorMessage(body) : undefined,
    }),

  info: (title: string, body?: string) =>
    useToastStore.getState().push({
      kind: 'info',
      title: localizeErrorMessage(title),
      body: body ? localizeErrorMessage(body) : undefined,
    }),

  warning: (title: string, body?: string) =>
    useToastStore.getState().push({
      kind: 'warning',
      title: localizeErrorMessage(title),
      body: body ? localizeErrorMessage(body) : undefined,
    }),

  /** Shows whatever a caught value has to say, without leaking stack traces. */
  fromError: (error: unknown, fallback = 'unknown') =>
    useToastStore.getState().push({
      kind: 'danger',
      title: apiErrorMessage(error, fallback),
    }),
}

