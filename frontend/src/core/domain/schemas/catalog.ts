import { z } from 'zod'

import { moneySchema, timestamp } from './common'
import { userSchema } from './user'

/* ------------------------------------------------------------- Categories */

export const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    id: z.number().int(),
    parent_id: z.number().int().nullable(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    position: z.number().int(),
    is_active: z.boolean(),
    courses_count: z.number().int().optional(),
    children: z.array(categorySchema).optional(),
  }),
)

export interface Category {
  id: number
  parent_id: number | null
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  position: number
  is_active: boolean
  courses_count?: number
  children?: Category[]
}

/* ---------------------------------------------------------------- Courses */

export const courseLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'all_levels'])
export type CourseLevel = z.infer<typeof courseLevelSchema>

export const courseStatusSchema = z.enum(['draft', 'pending_review', 'published', 'archived'])
export type CourseStatus = z.infer<typeof courseStatusSchema>

export const lessonTypeSchema = z.enum(['video', 'article', 'quiz', 'assignment', 'resource'])
export type LessonType = z.infer<typeof lessonTypeSchema>

export const courseSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  slug: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable().optional(),
  outcomes: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  thumbnail_url: z.string().nullable(),
  level: courseLevelSchema,
  level_label: z.string(),
  language: z.string(),
  status: courseStatusSchema,
  price: moneySchema,
  duration_minutes: z.number().int(),
  lessons_count: z.number().int(),
  sections_count: z.number().int(),
  students_count: z.number().int(),
  rating: z.object({
    average: z.number(),
    count: z.number().int(),
  }),
  is_featured: z.boolean(),
  published_at: timestamp,
  created_at: timestamp,
  instructor: userSchema.nullish(),
  category: categorySchema.nullish(),
  is_enrolled: z.boolean().optional(),
  is_wishlisted: z.boolean().optional(),
})

export type Course = z.infer<typeof courseSchema>

export const lessonSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int(),
  section_id: z.number().int(),
  title: z.string(),
  slug: z.string(),
  type: lessonTypeSchema,
  duration_minutes: z.number().int(),
  position: z.number().int(),
  is_preview: z.boolean(),
  is_published: z.boolean(),
  is_locked: z.boolean(),

  // Withheld by the API when the lesson is locked.
  content: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  video_provider: z.string().nullable().optional(),
  video_duration_seconds: z.number().int().nullable(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional(),

  has_quiz: z.boolean().nullable().optional(),
  has_assignment: z.boolean().nullable().optional(),
  quiz: z.unknown().optional(),
  assignment: z.unknown().optional(),

  is_completed: z.boolean().optional(),
  last_position_seconds: z.number().int().optional(),
})

export type Lesson = z.infer<typeof lessonSchema>

export const sectionSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  position: z.number().int(),
  lessons_count: z.number().int().optional(),
  duration_minutes: z.number().int().optional(),
  lessons: z.array(lessonSchema).optional(),
})

export type Section = z.infer<typeof sectionSchema>

export const courseDetailSchema = courseSchema.extend({
  description: z.string().nullable(),
  promo_video_url: z.string().nullable(),
  requirements: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  target_audience: z.array(z.string()).default([]),
  sections: z.array(sectionSchema).default([]),
  updated_at: timestamp.optional(),
})

export type CourseDetail = z.infer<typeof courseDetailSchema>

export const courseReadinessSchema = z.object({
  is_ready: z.boolean(),
  problems: z.array(z.string()),
})

export type CourseReadiness = z.infer<typeof courseReadinessSchema>

/* ----------------------------------------------------------------- Sorting */

export const courseSortSchema = z.enum([
  'newest',
  'oldest',
  'popular',
  'rating',
  'price_asc',
  'price_desc',
  'title',
])

export type CourseSort = z.infer<typeof courseSortSchema>

export const COURSE_SORT_LABELS: Record<CourseSort, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  popular: 'Most popular',
  rating: 'Highest rated',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  title: 'Title (A–Z)',
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all_levels: 'All levels',
}
