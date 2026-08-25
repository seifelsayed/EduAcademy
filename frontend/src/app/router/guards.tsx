import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { CenteredSpinner } from '@/components/atoms/Spinner'
import { canTeach, isAdmin } from '@/core/domain/schemas/user'
import { useAuthReady, useCurrentUser } from '@/stores/authStore'

interface GuardProps {
  children: ReactNode
}

/**
 * Blocks a route until the session check has settled, then either renders or
 * redirects. Waiting matters: without it a reload flashes the login page for
 * every signed-in user.
 */
export function RequireAuth({ children }: GuardProps) {
  const user = useCurrentUser()
  const isReady = useAuthReady()
  const location = useLocation()

  if (!isReady) return <CenteredSpinner label="Checking your session" />

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <>{children}</>
}

export function RequireInstructor({ children }: GuardProps) {
  const user = useCurrentUser()
  const isReady = useAuthReady()

  if (!isReady) return <CenteredSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!canTeach(user.role)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

export function RequireAdmin({ children }: GuardProps) {
  const user = useCurrentUser()
  const isReady = useAuthReady()

  if (!isReady) return <CenteredSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin(user.role)) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}

/** Keeps signed-in users away from the login and register screens. */
export function RequireGuest({ children }: GuardProps) {
  const user = useCurrentUser()
  const isReady = useAuthReady()

  if (!isReady) return <CenteredSpinner />
  if (user) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
