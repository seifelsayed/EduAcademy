import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { UserRole, UserStatus } from '@/core/domain/schemas/user'
import { adminApi, dashboardApi } from '@/core/infrastructure/api/dashboardApi'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

export function useStudentDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.student,
    queryFn: () => dashboardApi.student(),
  })
}

/**
 * `enabled` lets the sidebar reuse this query for its grading badge without
 * firing it for users who cannot teach.
 */
export function useInstructorDashboard(days = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboard.instructor(days),
    queryFn: () => dashboardApi.instructor(days),
    enabled: options?.enabled ?? true,
  })
}

export function useAdminDashboard(days = 30, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.dashboard.admin(days),
    queryFn: () => dashboardApi.admin(days),
    enabled: options?.enabled ?? true,
  })
}

export function useAdminUsers(params: {
  search?: string
  role?: UserRole
  status?: UserStatus
  page?: number
}) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () => adminApi.listUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: {
      name: string
      email: string
      password: string
      role: UserRole
      status: UserStatus
      headline?: string
      bio?: string
    }) => adminApi.createUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User created successfully.')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: {
        name?: string
        email?: string
        password?: string
        role?: UserRole
        status?: UserStatus
        headline?: string
        bio?: string
      }
    }) => adminApi.updateUser(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User updated.')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast.success('User deleted.')
    },
    onError: (error) => toast.fromError(error),
  })
}
