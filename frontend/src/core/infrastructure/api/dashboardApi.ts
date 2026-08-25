import type { AdminRepository, DashboardRepository } from '@/core/domain/repositories'
import {
  adminDashboardSchema,
  instructorDashboardSchema,
  studentDashboardSchema,
} from '@/core/domain/schemas/dashboard'
import { userSchema } from '@/core/domain/schemas/user'
import { http } from '@/core/infrastructure/http/httpClient'

export const dashboardApi: DashboardRepository = {
  student() {
    return http.get('/dashboard/student', studentDashboardSchema)
  },

  instructor(days = 30) {
    return http.get('/dashboard/instructor', instructorDashboardSchema, { params: { days } })
  },

  admin(days = 30) {
    return http.get('/dashboard/admin', adminDashboardSchema, { params: { days } })
  },
}

export const adminApi: AdminRepository = {
  listUsers(params) {
    return http.getPaginated('/admin/users', userSchema, { params })
  },

  getUser(id) {
    return http.get(`/admin/users/${id}`, userSchema)
  },

  createUser(input) {
    return http.post('/admin/users', input, userSchema)
  },

  updateUser(id, input) {
    return http.patch(`/admin/users/${id}`, input, userSchema)
  },

  deleteUser(id) {
    return http.command('delete', `/admin/users/${id}`)
  },
}
