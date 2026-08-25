import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { isApiError } from '@/core/domain/errors/ApiError'
import type { LoginForm, PasswordForm, ProfileForm, RegisterForm } from '@/core/domain/schemas/forms'
import { authApi } from '@/core/infrastructure/api/authApi'
import { tokenStorage } from '@/core/infrastructure/storage/tokenStorage'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'
import { queryKeys } from '@/shared/lib/queryKeys'

/**
 * Restores the session on boot. Runs only when a token exists — an anonymous
 * visitor should not pay for a guaranteed 401.
 */
export function useSessionBootstrap(): void {
  const setUser = useAuthStore((state) => state.setUser)
  const markReady = useAuthStore((state) => state.markReady)

  const hasToken = tokenStorage.get() !== null

  const { data, isFetched } = useQuery({
    queryKey: queryKeys.auth.me,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        return await authApi.me()
      } catch (error) {
        // An expired or revoked token must not block the app from rendering.
        if (isApiError(error) && error.isUnauthenticated) {
          tokenStorage.clear()
        }

        throw error
      }
    },
  })

  useEffect(() => {
    // Nothing to restore, or the restore attempt has settled either way:
    // unblock the route guards.
    if (!hasToken) {
      markReady()
      return
    }

    if (isFetched) {
      setUser(data ?? null)
    }
  }, [hasToken, isFetched, data, markReady, setUser])
}

export function useLogin() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: LoginForm) => authApi.login(input),
    onSuccess: async (payload) => {
      setUser(payload.user)
      // A different account must not read the previous one's cached data.
      await queryClient.resetQueries()
      queryClient.setQueryData(queryKeys.auth.me, payload.user)

      toast.success(`Welcome back, ${payload.user.name.split(' ')[0]}.`)
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useRegister() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (input: RegisterForm) => authApi.register(input),
    onSuccess: async (payload) => {
      setUser(payload.user)
      await queryClient.resetQueries()
      queryClient.setQueryData(queryKeys.auth.me, payload.user)

      toast.success('Your account is ready.')
      navigate('/dashboard', { replace: true })
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((state) => state.clear)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      clear()
      queryClient.clear()
      navigate('/', { replace: true })
    },
  })
}

export function useUpdateProfile() {
  const setUser = useAuthStore((state) => state.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, avatar }: { input: ProfileForm; avatar?: File | null }) =>
      authApi.updateProfile(input as Record<string, unknown>, avatar),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(queryKeys.auth.me, user)
      toast.success('Profile updated.')
    },
    onError: (error) => toast.fromError(error, 'Could not update your profile.'),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: PasswordForm) => authApi.changePassword(input),
    onSuccess: () => toast.success('Password changed.', 'Your other devices have been signed out.'),
  })
}
