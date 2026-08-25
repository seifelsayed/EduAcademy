import { Pagination } from '@/components/molecules/Pagination'
import { CourseFilterPanel } from '@/components/organisms/CourseFilterPanel'
import { CourseGrid } from '@/components/organisms/CourseGrid'
import { PageHeader } from '@/components/templates/PageHeader'
import { useCategories, useFilteredCatalog } from '@/features/catalog/hooks'
import { useToggleWishlist } from '@/features/engagement/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useIsAuthenticated } from '@/stores/authStore'
import { useCatalogFilterStore, useCourseFilters } from '@/stores/catalogFilterStore'

export function CourseBrowsePage() {
  const filters = useCourseFilters()
  const setPage = useCatalogFilterStore((state) => state.setPage)
  const { t, isAr } = useTranslation()

  const isAuthenticated = useIsAuthenticated()
  const catalog = useFilteredCatalog(filters)
  const categories = useCategories(true)
  const toggleWishlist = useToggleWishlist()

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8">
      <PageHeader
        pretitle={isAr ? 'دليل الكورسات المعتمدة' : 'Verified Catalog'}
        title={t('courses.catalogTitle')}
        description={t('courses.catalogSubtitle')}
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.courses') }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-6">
        <aside className="lg:col-span-1 sticky top-24">
          <CourseFilterPanel categories={categories.data ?? []} totalResults={catalog.totalFiltered} />
        </aside>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <CourseGrid
            courses={catalog.items}
            loading={catalog.isLoading}
            columns={3}
            skeletonCount={6}
            onToggleWishlist={isAuthenticated ? (slug) => toggleWishlist.mutate(slug) : undefined}
            emptyTitle={t('courses.noCoursesFound')}
            emptyDescription={t('courses.noCoursesFoundDesc')}
          />

          <Pagination meta={catalog.meta} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
