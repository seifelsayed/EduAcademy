import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import type { CourseFilters } from '@/core/domain/repositories'
import type { CourseForm, LessonForm, SectionForm } from '@/core/domain/schemas/forms'
import { catalogApi } from '@/core/infrastructure/api/catalogApi'
import { curriculumApi } from '@/core/infrastructure/api/curriculumApi'
import { applyCoursePipeline, paginateCourses } from '@/features/catalog/filtering'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

/* --------------------------------------------------------------- Browsing */

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () => catalogApi.listCourses(filters),
    // Keeping the previous page on screen avoids a full-grid flash while the
    // next page loads.
    placeholderData: keepPreviousData,
  })
}

/**
 * The whole published catalogue as one queryable source list.
 *
 * Browsing filters/sorts/searches derive from this client-side (see
 * `applyCoursePipeline`), so every control operates on the same data in the
 * same request lifecycle and counts always match what is rendered.
 */
export function useCatalog() {
  return useQuery({
    queryKey: ['courses', 'catalog'],
    queryFn: () => catalogApi.listCourses({ per_page: 100 }),
    staleTime: 60 * 1000,
  })
}

/**
 * Derived catalogue view for the browse page: source data + filters →
 * search/category/level/rating/free pipeline → sort → pagination slice.
 * Nothing here is stored in state; every value recomputes from inputs.
 */
export function useFilteredCatalog(filters: CourseFilters) {
  const catalog = useCatalog()

  const filtered = useMemo(
    () => applyCoursePipeline(catalog.data?.items ?? [], filters),
    [catalog.data, filters],
  )

  const paged = useMemo(
    () => paginateCourses(filtered, filters.page ?? 1, filters.per_page ?? 12),
    [filtered, filters.page, filters.per_page],
  )

  return {
    items: paged.items,
    meta: paged.meta,
    totalFiltered: filtered.length,
    isLoading: catalog.isLoading,
    isError: catalog.isError,
    error: catalog.error,
  }
}

export function useMyCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: queryKeys.courses.mine(filters),
    queryFn: () => catalogApi.listMyCourses(filters),
    placeholderData: keepPreviousData,
  })
}

export function useFeaturedCourses() {
  return useQuery({
    queryKey: queryKeys.courses.featured,
    queryFn: () => catalogApi.featuredCourses(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCourse(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug ?? ''),
    queryFn: () => catalogApi.getCourse(slug as string),
    enabled: Boolean(slug),
  })
}

export function useCategories(withCounts = false) {
  return useQuery({
    queryKey: queryKeys.categories.list(withCounts),
    queryFn: () => catalogApi.listCategories(withCounts),
    // The taxonomy barely changes; refetching it on every navigation is waste.
    staleTime: 30 * 60 * 1000,
  })
}

/* ------------------------------------------------------------- Authoring */

export function useCreateCourse() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ input, thumbnail }: { input: CourseForm; thumbnail?: File | null }) =>
      catalogApi.createCourse(input as Record<string, unknown>, thumbnail),
    onSuccess: async (course) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      toast.success('Course created.', 'Now add your curriculum.')
      navigate(`/teach/courses/${course.slug}/curriculum`)
    },
    onError: (error) => toast.fromError(error, 'Could not create the course.'),
  })
}

export function useUpdateCourse(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, thumbnail }: { input: Partial<CourseForm>; thumbnail?: File | null }) =>
      catalogApi.updateCourse(slug, input as Record<string, unknown>, thumbnail),
    onSuccess: async (course) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      toast.success('Course saved.')

      return course
    },
    onError: (error) => toast.fromError(error, 'Could not save the course.'),
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (slug: string) => catalogApi.deleteCourse(slug),
    onSuccess: async (_, slug) => {
      queryClient.removeQueries({ queryKey: queryKeys.courses.detail(slug) })
      queryClient.removeQueries({ queryKey: queryKeys.courses.readiness(slug) })
      navigate('/teach/courses')
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      toast.success('Course deleted.')
    },
    onError: (error) => toast.fromError(error, 'Could not delete the course.'),
  })
}


export function useCourseReadiness(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.readiness(slug ?? ''),
    queryFn: () => catalogApi.readiness(slug as string),
    enabled: Boolean(slug),
  })
}

export function useCourseStatusActions(slug: string) {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
  }

  const publish = useMutation({
    mutationFn: () => catalogApi.publishCourse(slug),
    onSuccess: async () => {
      await refresh()
      toast.success('Course published.', 'Learners can find it now.')
    },
    onError: (error) => toast.fromError(error, 'The course is not ready to publish.'),
  })

  const unpublish = useMutation({
    mutationFn: () => catalogApi.unpublishCourse(slug),
    onSuccess: async () => {
      await refresh()
      toast.info('Course moved back to draft.')
    },
    onError: (error) => toast.fromError(error),
  })

  const archive = useMutation({
    mutationFn: () => catalogApi.archiveCourse(slug),
    onSuccess: async () => {
      await refresh()
      toast.info('Course archived.')
    },
    onError: (error) => toast.fromError(error),
  })

  return { publish, unpublish, archive }
}

/* ------------------------------------------------------------ Curriculum */

export function useSections(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.courses.sections(slug ?? ''),
    queryFn: () => curriculumApi.listSections(slug as string),
    enabled: Boolean(slug),
  })
}

export function useCurriculumMutations(slug: string) {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.sections(slug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.readiness(slug) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(slug) })
  }

  const createSection = useMutation({
    mutationFn: (input: SectionForm) => curriculumApi.createSection(slug, input),
    onSuccess: async () => {
      await refresh()
      toast.success('Section added.')
    },
    onError: (error) => toast.fromError(error),
  })

  const updateSection = useMutation({
    mutationFn: ({ id, input }: { id: number; input: SectionForm }) =>
      curriculumApi.updateSection(id, input),
    onSuccess: refresh,
    onError: (error) => toast.fromError(error),
  })

  const deleteSection = useMutation({
    mutationFn: (id: number) => curriculumApi.deleteSection(id),
    onSuccess: async () => {
      await refresh()
      toast.success('Section deleted.')
    },
    onError: (error) => toast.fromError(error),
  })

  const reorderSections = useMutation({
    mutationFn: (ids: number[]) => curriculumApi.reorderSections(slug, ids),
    onSuccess: refresh,
    onError: (error) => toast.fromError(error),
  })

  const createLesson = useMutation({
    mutationFn: ({ sectionId, input }: { sectionId: number; input: LessonForm }) =>
      curriculumApi.createLesson(sectionId, input),
    onSuccess: async () => {
      await refresh()
      toast.success('Lesson added.')
    },
    onError: (error) => toast.fromError(error),
  })

  const updateLesson = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<LessonForm> }) =>
      curriculumApi.updateLesson(id, input),
    onSuccess: async () => {
      await refresh()
      toast.success('Lesson saved.')
    },
    onError: (error) => toast.fromError(error),
  })

  const deleteLesson = useMutation({
    mutationFn: (id: number) => curriculumApi.deleteLesson(id),
    onSuccess: async () => {
      await refresh()
      toast.success('Lesson deleted.')
    },
    onError: (error) => toast.fromError(error),
  })

  const reorderLessons = useMutation({
    mutationFn: ({ sectionId, ids }: { sectionId: number; ids: number[] }) =>
      curriculumApi.reorderLessons(sectionId, ids),
    onSuccess: refresh,
    onError: (error) => toast.fromError(error),
  })

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
  }
}
