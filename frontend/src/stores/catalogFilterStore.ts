import { useMemo } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

import type { CourseFilters } from '@/core/domain/repositories'
import type { CourseLevel, CourseSort } from '@/core/domain/schemas/catalog'

interface CatalogFilterState extends CourseFilters {
  setSearch: (search: string) => void
  setCategory: (categoryId: number | undefined) => void
  setLevel: (level: CourseLevel | undefined) => void
  setSort: (sort: CourseSort) => void
  setFreeOnly: (free: boolean) => void
  setMinRating: (rating: number | undefined) => void
  setPage: (page: number) => void
  reset: () => void
}

const INITIAL: CourseFilters = {
  search: '',
  category_id: undefined,
  level: undefined,
  free: undefined,
  min_rating: undefined,
  sort: 'newest',
  page: 1,
  per_page: 12,
}

/**
 * Catalogue filters live in a store rather than in each page so the browse
 * page, the header search box and the category chips all stay in step.
 * Changing any filter resets pagination — otherwise page 4 of the old result
 * set is requested against the new one.
 */
export const useCatalogFilterStore = create<CatalogFilterState>()((set) => ({
  ...INITIAL,

  setSearch: (search) => set({ search, page: 1 }),
  setCategory: (category_id) => set({ category_id, page: 1 }),
  setLevel: (level) => set({ level, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setFreeOnly: (free) => set({ free: free ? true : undefined, page: 1 }),
  setMinRating: (min_rating) => set({ min_rating, page: 1 }),
  setPage: (page) => set({ page }),

  reset: () => set(INITIAL),
}))

/**
 * The subset the API cares about, as a referentially stable object.
 *
 * A selector that built this object inline would return a new reference on
 * every render, and Zustand's identity check would loop forever — hence the
 * shallow-compared primitive selection plus a memo.
 */
export function useCourseFilters(): CourseFilters {
  const { search, category_id, level, free, min_rating, sort, page, per_page } =
    useCatalogFilterStore(
      useShallow((state) => ({
        search: state.search,
        category_id: state.category_id,
        level: state.level,
        free: state.free,
        min_rating: state.min_rating,
        sort: state.sort,
        page: state.page,
        per_page: state.per_page,
      })),
    )

  return useMemo(
    () => ({
      search: search?.trim() || undefined,
      category_id,
      level,
      free,
      min_rating,
      sort,
      page,
      per_page,
    }),
    [search, category_id, level, free, min_rating, sort, page, per_page],
  )
}

/** True when anything beyond the default sort is active. */
export function hasActiveFilters(state: CourseFilters): boolean {
  return Boolean(state.search?.trim() || state.category_id || state.level || state.free || state.min_rating)
}
