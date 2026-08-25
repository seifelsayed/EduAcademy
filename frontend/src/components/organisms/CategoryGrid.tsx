import { IconSchool } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

import type { Category } from '@/core/domain/schemas/catalog'
import { getLocalizedCategoryName } from '@/features/catalog/localizedCatalog'
import { useTranslation } from '@/shared/lib/i18n'
import { useCatalogFilterStore } from '@/stores/catalogFilterStore'

interface CategoryGridProps {
  categories: Category[]
  loading?: boolean
  limit?: number
}

export function getCategoryThumbnail(slugOrName: string): string {
  const text = slugOrName.toLowerCase()

  // 1. Digital Marketing
  if (text.includes('market') || text.includes('تسويق') || text.includes('digital-marketing') || text.includes('ads')) {
    return '/assets/brand/digital-marketing-specialization.webp'
  }

  // 2. Entrepreneurship & Startups
  if (text.includes('entrepreneur') || text.includes('startup') || text.includes('ريادة') || text.includes('مشروع')) {
    return '/assets/brand/entrepreneurship-specialization.webp'
  }

  // 3. Business & Management
  if (text.includes('business') || text.includes('manage') || text.includes('أعمال') || text.includes('إدارة') || text.includes('قيادة')) {
    return '/assets/brand/business-specialization.webp'
  }

  // 4. Web & Frontend Development
  if (text.includes('web') || text.includes('front') || text.includes('react') || text.includes('ويب')) {
    return '/assets/brand/thumb_web_dev.jpg'
  }

  // 5. Software & General Development
  if (text.includes('dev') || text.includes('code') || text.includes('soft') || text.includes('برمج') || text.includes('تطوير')) {
    return '/assets/brand/development-specialization.webp'
  }

  // 6. UI/UX Design
  if (text.includes('ui') || text.includes('ux') || text.includes('design') || text.includes('تصميم')) {
    return '/assets/brand/thumb_uiux_design.jpg'
  }

  // 7. AI & Data Science
  if (
    text.includes('ai') ||
    text.includes('machine') ||
    text.includes('data') ||
    text.includes('intelligence') ||
    text.includes('ذكاء') ||
    text.includes('بيانات')
  ) {
    return '/assets/brand/thumb_ai_data.jpg'
  }

  // 8. Cyber Security & Cloud
  if (
    text.includes('cyber') ||
    text.includes('sec') ||
    text.includes('cloud') ||
    text.includes('أمن') ||
    text.includes('سحاب')
  ) {
    return '/assets/brand/thumb_cyber_sec.jpg'
  }

  // 9. Mobile App Development
  if (
    text.includes('mobile') ||
    text.includes('flutter') ||
    text.includes('ios') ||
    text.includes('android') ||
    text.includes('هاتف') ||
    text.includes('تطبيق')
  ) {
    return '/assets/brand/thumb_mobile_dev.jpg'
  }

  return '/assets/brand/student_learning_3d.jpg'
}

export function CategoryGrid({ categories, loading = false, limit = 8 }: CategoryGridProps) {
  const navigate = useNavigate()
  const setCategory = useCatalogFilterStore((state) => state.setCategory)
  const { tPlural, isAr, language } = useTranslation()

  const items = categories.slice(0, limit)

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
        {Array.from({ length: limit }).map((_, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
            <div className="w-full aspect-[16/10] bg-surface-muted" />
            <div className="p-3 sm:p-5 flex flex-col gap-2">
              <div className="w-2/3 h-4 bg-surface-muted rounded-md" />
              <div className="w-1/3 h-3 bg-surface-muted rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {items.map((category) => {
        const catName = getLocalizedCategoryName(category, language)
        return (
          <button
            key={category.id}
            type="button"
            className="group bg-surface border border-border hover:border-primary/50 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col text-start"
            onClick={() => {
              setCategory(category.id)
              navigate('/courses')
            }}
          >
            {/* Category Image Header Banner */}
            <div className="relative w-full aspect-[16/10] overflow-hidden bg-surface-muted border-b border-border">
              <img
                src={getCategoryThumbnail(category.slug || category.name)}
                alt={catName}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div
                className={`absolute top-3 ${
                  isAr ? 'right-3' : 'left-3'
                } w-9 h-9 rounded-2xl bg-surface/90 backdrop-blur-md text-primary border border-border/80 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
              >
                <IconSchool size={20} />
              </div>
            </div>

            {/* Category Card Body */}
            <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-1.5 sm:gap-2">
              <h3 className="font-heading font-black text-xs sm:text-base text-text-main group-hover:text-primary transition-colors leading-snug line-clamp-2 m-0">
                {catName}
              </h3>
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <p className="text-[10px] sm:text-xs text-text-muted m-0 font-medium">
                  {tPlural(category.courses_count ?? 0, 'courses')}
                </p>
                <span className="text-[10px] sm:text-[11px] font-bold text-primary group-hover:underline whitespace-nowrap">
                  {isAr ? 'استكشف ←' : 'Explore →'}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
