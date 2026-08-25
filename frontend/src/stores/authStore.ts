import { create } from 'zustand'

import type { User } from '@/core/domain/schemas/user'
import { canTeach, isAdmin } from '@/core/domain/schemas/user'
import { tokenStorage } from '@/core/infrastructure/storage/tokenStorage'

/**
 * Who is signed in.
 *
 * The store holds identity only. Fetching, refreshing and cache invalidation
 * belong to React Query — mixing the two is what makes auth state drift.
 */
interface AuthState {
  user: User | null
  /** False until the initial `me()` call settles, so guards can wait. */
  isReady: boolean

  setUser: (user: User | null) => void
  markReady: () => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isReady: false,

  setUser: (user) => set({ user, isReady: true }),
  markReady: () => set({ isReady: true }),

  clear: () => {
    tokenStorage.clear()
    set({ user: null, isReady: true })
  },
}))

/* ------------------------------------------------------------- Selectors */

export const useCurrentUser = (): User | null => useAuthStore((state) => state.user)

export const useIsAuthenticated = (): boolean => useAuthStore((state) => state.user !== null)

export const useAuthReady = (): boolean => useAuthStore((state) => state.isReady)

export const useCanTeach = (): boolean =>
  useAuthStore((state) => (state.user ? canTeach(state.user.role) : false))

export const useIsAdmin = (): boolean =>
  useAuthStore((state) => (state.user ? isAdmin(state.user.role) : false))
