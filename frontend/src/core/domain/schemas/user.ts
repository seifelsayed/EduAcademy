import { z } from 'zod'

import { timestamp } from './common'

export const userRoleSchema = z.enum(['admin', 'instructor', 'student'])
export type UserRole = z.infer<typeof userRoleSchema>

export const userStatusSchema = z.enum(['active', 'suspended', 'pending'])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  role: userRoleSchema,
  avatar_url: z.string().nullable(),
  headline: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  social_links: z.record(z.string(), z.string()).optional().default({}),

  // Present only when the viewer is the account owner or an admin.
  email: z.string().nullable().optional(),
  email_verified: z.boolean().nullable().optional(),
  status: userStatusSchema.nullable().optional(),
  locale: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  last_login_at: timestamp.nullable().optional(),

  courses_count: z.number().int().optional(),
  enrollments_count: z.number().int().optional(),
  students_total: z.number().int().optional(),

  created_at: timestamp.nullable().optional(),
})

export type User = z.infer<typeof userSchema>

export const authPayloadSchema = z.object({
  user: userSchema,
  token: z.string(),
})

export type AuthPayload = z.infer<typeof authPayloadSchema>

export const userStatisticsSchema = z.object({
  total: z.number().int(),
  students: z.number().int(),
  instructors: z.number().int(),
  admins: z.number().int(),
  new_this_month: z.number().int(),
})

export type UserStatistics = z.infer<typeof userStatisticsSchema>

/** Roles allowed to reach the course-authoring area. */
export function canTeach(role: UserRole): boolean {
  return role === 'admin' || role === 'instructor'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin'
}
