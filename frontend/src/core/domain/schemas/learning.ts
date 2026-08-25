import { z } from 'zod'

import { courseDetailSchema, courseSchema, lessonSchema } from './catalog'
import { timestamp } from './common'
import { userSchema } from './user'

export const enrollmentStatusSchema = z.enum(['active', 'completed', 'cancelled', 'expired'])
export type EnrollmentStatus = z.infer<typeof enrollmentStatusSchema>

export const certificateSchema = z.object({
  id: z.number().int(),
  serial: z.string(),
  recipient_name: z.string(),
  course_title: z.string(),
  instructor_name: z.string(),
  final_score: z.number(),
  issued_at: timestamp,
  verify_url: z.string(),
  course: courseSchema.nullish(),
})

export type Certificate = z.infer<typeof certificateSchema>

export const enrollmentSchema = z.object({
  id: z.number().int(),
  status: enrollmentStatusSchema,
  progress_percent: z.number(),
  completed_lessons_count: z.number().int(),
  enrolled_at: timestamp,
  last_accessed_at: timestamp,
  completed_at: timestamp,
  expires_at: timestamp,
  is_expired: z.boolean(),
  course: courseSchema.nullish(),
  student: userSchema.nullish(),
  last_lesson: lessonSchema.nullish(),
  certificate: certificateSchema.nullish(),
})

export type Enrollment = z.infer<typeof enrollmentSchema>

/** Everything the course player renders in one payload. */
export const coursePlayerSchema = z.object({
  course: courseDetailSchema,
  enrollment: enrollmentSchema,
  current_lesson: lessonSchema.nullable(),
  next_lesson: z
    .object({
      id: z.number().int(),
      title: z.string(),
      slug: z.string(),
      type: z.string(),
    })
    .nullable(),
  previous_lesson: z
    .object({
      id: z.number().int(),
      title: z.string(),
      slug: z.string(),
      type: z.string(),
    })
    .nullable(),
  completed_lesson_ids: z.array(z.number().int()),
  total_watched_seconds: z.number().int(),
})

export type CoursePlayer = z.infer<typeof coursePlayerSchema>

export const lessonProgressSchema = z.object({
  is_completed: z.boolean(),
  watched_seconds: z.number().int(),
  last_position_seconds: z.number().int(),
  enrollment: enrollmentSchema,
})

export type LessonProgressResult = z.infer<typeof lessonProgressSchema>
