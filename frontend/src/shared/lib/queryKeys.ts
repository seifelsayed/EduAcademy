import type { CourseFilters } from '@/core/domain/repositories'

/**
 * One place that owns every React Query cache key.
 *
 * Keys are hierarchical so a mutation can invalidate a whole subtree — e.g.
 * `queryKeys.courses.all` clears every course list and detail at once.
 */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },

  courses: {
    all: ['courses'] as const,
    list: (filters: CourseFilters) => ['courses', 'list', filters] as const,
    mine: (filters: CourseFilters) => ['courses', 'mine', filters] as const,
    featured: ['courses', 'featured'] as const,
    detail: (slug: string) => ['courses', 'detail', slug] as const,
    readiness: (slug: string) => ['courses', 'readiness', slug] as const,
    sections: (slug: string) => ['courses', 'sections', slug] as const,
    roster: (slug: string, page: number) => ['courses', 'roster', slug, page] as const,
    assignments: (slug: string) => ['courses', 'assignments', slug] as const,
  },

  categories: {
    all: ['categories'] as const,
    list: (withCounts: boolean) => ['categories', 'list', withCounts] as const,
  },

  learning: {
    all: ['learning'] as const,
    enrollments: (status: string | undefined, page: number) =>
      ['learning', 'enrollments', status ?? 'any', page] as const,
    enrollment: (slug: string) => ['learning', 'enrollment', slug] as const,
    player: (slug: string, lesson?: string) => ['learning', 'player', slug, lesson ?? 'current'] as const,
    certificates: ['learning', 'certificates'] as const,
    certificate: (serial: string) => ['learning', 'certificate', serial] as const,
  },

  assessment: {
    all: ['assessment'] as const,
    quiz: (id: number) => ['assessment', 'quiz', id] as const,
    attempt: (id: number) => ['assessment', 'attempt', id] as const,
    attempts: (quizId: number) => ['assessment', 'attempts', quizId] as const,
    assignment: (id: number) => ['assessment', 'assignment', id] as const,
    submissions: (assignmentId: number, page: number) =>
      ['assessment', 'submissions', assignmentId, page] as const,
    pending: (page: number) => ['assessment', 'pending', page] as const,
    submission: (id: number) => ['assessment', 'submission', id] as const,
  },

  engagement: {
    reviews: (slug: string, rating: number | undefined, page: number) =>
      ['engagement', 'reviews', slug, rating ?? 'any', page] as const,
    wishlist: ['engagement', 'wishlist'] as const,
  },

  billing: {
    quote: (slug: string) => ['billing', 'quote', slug] as const,
    order: (reference: string) => ['billing', 'order', reference] as const,
    orders: (page: number) => ['billing', 'orders', page] as const,
    adminOrders: (status: string | undefined, page: number) =>
      ['billing', 'admin-orders', status ?? 'any', page] as const,
  },

  dashboard: {
    student: ['dashboard', 'student'] as const,
    instructor: (days: number) => ['dashboard', 'instructor', days] as const,
    admin: (days: number) => ['dashboard', 'admin', days] as const,
  },

  admin: {
    users: (params: Record<string, unknown>) => ['admin', 'users', params] as const,
    user: (id: number) => ['admin', 'user', id] as const,
  },
} as const
