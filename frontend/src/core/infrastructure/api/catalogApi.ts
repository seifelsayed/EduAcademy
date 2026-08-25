import { z } from 'zod'

import type { CatalogRepository, CourseFilters } from '@/core/domain/repositories'
import {
  categorySchema,
  courseDetailSchema,
  courseReadinessSchema,
  courseSchema,
} from '@/core/domain/schemas/catalog'
import { ratingBreakdownSchema } from '@/core/domain/schemas/engagement'
import { http } from '@/core/infrastructure/http/httpClient'

/** Drops empty filters so the query string stays readable and cacheable. */
function toParams(filters: CourseFilters): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '' && value !== null),
  )
}

/**
 * Builds the multipart body for course create/update. Arrays have to be sent
 * with `key[]` notation for PHP to parse them back into a list.
 */
function toCourseForm(input: Record<string, unknown>, thumbnail?: File | null, method?: string): FormData {
  const form = new FormData()

  if (method) {
    form.append('_method', method)
  }

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null || value === '') continue

    if (Array.isArray(value)) {
      value.forEach((entry) => form.append(`${key}[]`, String(entry)))
      continue
    }

    form.append(key, String(value))
  }

  if (thumbnail) {
    form.append('thumbnail', thumbnail)
  }

  return form
}

export const catalogApi: CatalogRepository = {
  listCourses(filters) {
    return http.getPaginated('/courses', courseSchema, { params: toParams(filters) })
  },

  listMyCourses(filters) {
    return http.getPaginated('/instructor/courses', courseSchema, { params: toParams(filters) })
  },

  featuredCourses() {
    return http.get('/courses/featured', z.array(courseSchema))
  },

  async getCourse(slug) {
    // The extra payload (related courses, rating breakdown) travels in `meta`,
    // so this call goes through axios directly rather than http.get().
    const response = await http.raw.get(`/courses/${slug}`)

    const parsed = z
      .object({
        data: courseDetailSchema,
        meta: z
          .object({
            related: z.array(courseSchema).default([]),
            rating_breakdown: ratingBreakdownSchema.default({}),
          })
          .default({ related: [], rating_breakdown: {} }),
      })
      .parse(response.data)

    return {
      course: parsed.data,
      related: parsed.meta.related,
      ratingBreakdown: parsed.meta.rating_breakdown,
    }
  },

  createCourse(input, thumbnail) {
    if (thumbnail) {
      return http.upload('/courses', toCourseForm(input, thumbnail), courseDetailSchema)
    }

    return http.post('/courses', input, courseDetailSchema)
  },

  updateCourse(slug, input, thumbnail) {
    if (thumbnail) {
      return http.upload(`/courses/${slug}`, toCourseForm(input, thumbnail, 'PATCH'), courseDetailSchema)
    }

    return http.patch(`/courses/${slug}`, input, courseDetailSchema)
  },

  deleteCourse(slug) {
    return http.command('delete', `/courses/${slug}`)
  },

  readiness(slug) {
    return http.get(`/courses/${slug}/readiness`, courseReadinessSchema)
  },

  publishCourse(slug) {
    return http.post(`/courses/${slug}/publish`, {}, courseDetailSchema)
  },

  unpublishCourse(slug) {
    return http.post(`/courses/${slug}/unpublish`, {}, courseDetailSchema)
  },

  archiveCourse(slug) {
    return http.post(`/courses/${slug}/archive`, {}, courseDetailSchema)
  },

  listCategories(withCounts = false) {
    return http.get('/categories', z.array(categorySchema), {
      params: withCounts ? { with_counts: 1 } : undefined,
    })
  },

  createCategory(input) {
    return http.post('/admin/categories', input, categorySchema)
  },

  updateCategory(id, input) {
    return http.patch(`/admin/categories/${id}`, input, categorySchema)
  },

  deleteCategory(id) {
    return http.command('delete', `/admin/categories/${id}`)
  },
}
