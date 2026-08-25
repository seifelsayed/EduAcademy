import { IconFilterOff } from '@tabler/icons-react'

import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Select } from '@/components/atoms/Select'
import { SearchInput } from '@/components/molecules/SearchInput'
import type { Category, CourseLevel, CourseSort } from '@/core/domain/schemas/catalog'
import { getLocalizedCategoryName } from '@/features/catalog/localizedCatalog'
import { useTranslation } from '@/shared/lib/i18n'
import { hasActiveFilters, useCatalogFilterStore } from '@/stores/catalogFilterStore'

interface CourseFilterPanelProps {
  categories: Category[]
  totalResults?: number
}

export function CourseFilterPanel({ categories, totalResults }: CourseFilterPanelProps) {
  const filters = useCatalogFilterStore()
  const { t, tPlural, isAr, language, formatNumber } = useTranslation()

  const flatCategories = categories.flatMap((category) => [
    category,
    ...(category.children ?? []),
  ])

  const levelOptions: { value: string; label: string }[] = [
    { value: '', label: t('common.level.all') },
    { value: 'beginner', label: t('common.level.beginner') },
    { value: 'intermediate', label: t('common.level.intermediate') },
    { value: 'advanced', label: t('common.level.advanced') },
  ]

  const sortOptions: { value: CourseSort; label: string }[] = [
    { value: 'newest', label: t('courses.sortNewest') },
    { value: 'popular', label: t('courses.sortPopular') },
    { value: 'rating', label: t('courses.sortRating') },
    { value: 'price_asc', label: t('courses.sortPriceAsc') },
    { value: 'price_desc', label: t('courses.sortPriceDesc') },
  ]

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      <div>
        <label className="block text-[11px] font-bold text-text-muted mb-1" htmlFor="catalog-search">
          {t('common.search')}
        </label>
        <div id="catalog-search">
          <SearchInput
            value={filters.search ?? ''}
            onChange={filters.setSearch}
            placeholder={t('courses.searchPlaceholder')}
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-text-muted mb-1" htmlFor="catalog-category">
          {t('courses.filterByCategory')}
        </label>
        <Select
          id="catalog-category"
          value={filters.category_id ?? ''}
          onChange={(event) =>
            filters.setCategory(event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <option value="">{t('common.all')}</option>
          {flatCategories.map((category) => {
            const localizedCatName = getLocalizedCategoryName(category, language)
            return (
              <option key={category.id} value={category.id}>
                {category.parent_id ? `— ${localizedCatName}` : localizedCatName}
                {category.courses_count !== undefined ? ` (${formatNumber(category.courses_count)})` : ''}
              </option>
            )
          })}
        </Select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-text-muted mb-1" htmlFor="catalog-level">
          {t('courses.filterByLevel')}
        </label>
        <Select
          id="catalog-level"
          value={filters.level ?? ''}
          onChange={(event) =>
            filters.setLevel((event.target.value || undefined) as CourseLevel | undefined)
          }
        >
          {levelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-text-muted mb-1" htmlFor="catalog-rating">
          {t('courses.rating')}
        </label>
        <Select
          id="catalog-rating"
          value={filters.min_rating ?? ''}
          onChange={(event) =>
            filters.setMinRating(event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <option value="">{t('common.all')}</option>
          <option value="4.5">{isAr ? '★ ٤٫٥ فأعلى' : '★ 4.5 and up'}</option>
          <option value="4">{isAr ? '★ ٤٫٠ فأعلى' : '★ 4.0 and up'}</option>
          <option value="3">{isAr ? '★ ٣٫٠ فأعلى' : '★ 3.0 and up'}</option>
        </Select>
      </div>

      <div>
        <label className="block text-[11px] font-bold text-text-muted mb-1" htmlFor="catalog-sort">
          {t('courses.sortBy')}
        </label>
        <Select
          id="catalog-sort"
          value={filters.sort ?? 'newest'}
          onChange={(event) => filters.setSort(event.target.value as CourseSort)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="pt-2 border-t border-border/80">
        <Checkbox
          label={t('courses.freeOnly')}
          checked={filters.free === true}
          onChange={(event) => filters.setFreeOnly(event.target.checked)}
        />
      </div>

      {totalResults !== undefined ? (
        <p className="text-xs font-medium text-text-muted pt-2 border-t border-border/80 m-0">
          <span className="font-bold text-text-main">{tPlural(totalResults, 'courses')}</span>
        </p>
      ) : null}

      {hasActiveFilters(filters) ? (
        <Button
          variant="ghost"
          size="sm"
          icon={<IconFilterOff size={15} />}
          onClick={filters.reset}
          className="w-full text-danger hover:bg-danger-light"
        >
          {t('common.clear')}
        </Button>
      ) : null}
    </div>
  )
}
