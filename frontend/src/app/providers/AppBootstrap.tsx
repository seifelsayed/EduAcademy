import { useEffect, type ReactNode } from 'react'

import { setUnauthenticatedHandler } from '@/core/infrastructure/http/httpClient'
import { useSessionBootstrap } from '@/features/auth/hooks'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

/**
 * Runs the one-time wiring the whole app depends on: restoring the session,
 * applying the stored theme, and teaching the HTTP layer how to react when the
 * server says the session is gone.
 */
export function AppBootstrap({ children }: { children: ReactNode }) {
  useSessionBootstrap()

  const theme = useUiStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
  }, [theme])

  useEffect(() => {
    // Any 401 anywhere clears the local identity, so guards redirect rather
    // than leaving a stale user in the header.
    setUnauthenticatedHandler(() => useAuthStore.getState().clear())
  }, [])

  return <>{children}</>
}
