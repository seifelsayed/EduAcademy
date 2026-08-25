import { z } from 'zod'

import { courseSchema } from './catalog'
import { reviewSchema } from './engagement'
import { certificateSchema, enrollmentSchema } from './learning'
import { userSchema, userStatisticsSchema } from './user'

/** Daily time series keyed by `YYYY-MM-DD`. */
export const seriesSchema = z.record(z.string(), z.number())
export type Series = z.infer<typeof seriesSchema>

export const studentDashboardSchema = z.object({
  stats: z.object({
    enrolled: z.number().int(),
    in_progress: z.number().int(),
    completed: z.number().int(),
    certificates: z.number().int(),
    average_progress: z.number(),
  }),
  continue_learning: z.array(enrollmentSchema),
  recent_certificates: z.array(certificateSchema),
})

export type StudentDashboard = z.infer<typeof studentDashboardSchema>

export const instructorDashboardSchema = z.object({
  stats: z.object({
    total: z.number().int(),
    published: z.number().int(),
    draft: z.number().int(),
    pending_review: z.number().int(),
    students: z.number().int(),
    revenue_cents: z.number().int(),
    currency: z.string(),
    average_rating: z.number(),
    pending_submissions: z.number().int(),
  }),
  charts: z.object({
    enrollments: seriesSchema,
    revenue: seriesSchema,
  }),
  top_courses: z.array(courseSchema),
  recent_reviews: z.array(reviewSchema),
})

export type InstructorDashboard = z.infer<typeof instructorDashboardSchema>

export const adminDashboardSchema = z.object({
  stats: z.object({
    users: userStatisticsSchema,
    courses: z.object({
      total: z.number().int(),
      published: z.number().int(),
      draft: z.number().int(),
      pending_review: z.number().int(),
    }),
    revenue_cents: z.number().int(),
    currency: z.string(),
  }),
  charts: z.object({
    enrollments: seriesSchema,
    revenue: seriesSchema,
  }),
  top_instructors: z.array(userSchema),
  featured_courses: z.array(courseSchema),
})

export type AdminDashboard = z.infer<typeof adminDashboardSchema>
