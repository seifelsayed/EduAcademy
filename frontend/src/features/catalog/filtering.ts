import type { Course, CourseSort } from '@/core/domain/schemas/catalog'
import type { CourseFilters } from '@/core/domain/repositories'
import { buildSearchHaystack, matchesSearch } from '@/shared/lib/searchText'

export interface CatalogPageMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

function courseHaystack(course: Course): string {
  return buildSearchHaystack([
    course.title,
    course.subtitle,
    course.description,
    course.slug,
    course.level_label,
    course.language,
    course.instructor?.name,
    course.instructor?.headline,
    course.category?.name,
    course.category?.slug,
    ...(course.outcomes ?? []),
    ...(course.requirements ?? []),
  ])
}

function effectivePriceCents(course: Course): number {
  return course.price?.effective_cents ?? Number.POSITIVE_INFINITY
}

function recencySeconds(course: Course): number {
  const value = course.published_at ?? course.created_at
  const time = value ? Date.parse(value) : NaN

  return Number.isNaN(time) ? 0 : time / 1000
}

const comparators: Record<CourseSort, (a: Course, b: Course) => number> = {
  newest: (a, b) => recencySeconds(b) - recencySeconds(a) || b.id - a.id,
  oldest: (a, b) => recencySeconds(a) - recencySeconds(b) || a.id - b.id,
  popular: (a, b) => (b.students_count ?? 0) - (a.students_count ?? 0) || b.id - a.id,
  rating:
    (a, b) =>
      (b.rating?.average ?? 0) - (a.rating?.average ?? 0) ||
      (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
  price_asc: (a, b) => effectivePriceCents(a) - effectivePriceCents(b) || a.id - b.id,
  price_desc: (a, b) => effectivePriceCents(b) - effectivePriceCents(a) || a.id - b.id,
  title: (a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'ar') || a.id - b.id,
}

/**
 * The single filter pipeline applied to the fetched catalogue:
 * search → category → level → rating → free → sort.
 * Pure: the source array is never mutated; sorting works on a copy.
 */
export function applyCoursePipeline(courses: Course[], filters: CourseFilters): Course[] {
  const search = filters.search ?? ''

  const filtered = courses.filter((course) => {
    if (search.trim() !== '' && !matchesSearch(courseHaystack(course), search)) return false

    if (filters.category_id !== undefined && course.category?.id !== filters.category_id) return false

    if (filters.level !== undefined && course.level !== filters.level) return false

    if (filters.min_rating !== undefined && (course.rating?.average ?? 0) < filters.min_rating)
      return false

    if (filters.free === true && course.price?.is_free !== true) return false

    return true
  })

  return [...filtered].sort(comparators[filters.sort ?? 'newest'] ?? comparators.newest)
}

/** Slices an already-filtered list and derives pagination metadata from it. */
export function paginateCourses(
  courses: Course[],
  page: number,
  perPage: number,
): { items: Course[]; meta: CatalogPageMeta } {
  const total = courses.length
  const safePerPage = Math.max(1, perPage)
  const lastPage = Math.max(1, Math.ceil(total / safePerPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)
  const start = (currentPage - 1) * safePerPage

  return {
    items: courses.slice(start, start + safePerPage),
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: safePerPage,
      total,
      from: total === 0 ? null : start + 1,
      to: total === 0 ? null : start + courses.slice(start, start + safePerPage).length,
    },
  }
}
