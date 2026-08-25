import {
  IconArrowLeft,
  IconArrowRight,
  IconPlayerPlay,
  IconSearch,
  IconStarFilled,
} from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { HighlightedText } from '@/components/atoms/HighlightedText'
import { BrandBadgeSticker } from '@/components/atoms/decorations/BrandBadgeSticker'
import { SparkleAccent } from '@/components/atoms/decorations/BrandDecorations'
import { CategoryGrid } from '@/components/organisms/CategoryGrid'
import { CourseGrid } from '@/components/organisms/CourseGrid'
import { useCategories, useFeaturedCourses } from '@/features/catalog/hooks'
import { useToggleWishlist } from '@/features/engagement/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useIsAuthenticated } from '@/stores/authStore'
import { useCatalogFilterStore } from '@/stores/catalogFilterStore'

export function HomePage() {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const { t, isAr } = useTranslation()

  const setSearch = useCatalogFilterStore((state) => state.setSearch)
  const featured = useFeaturedCourses()
  const categories = useCategories(true)
  const toggleWishlist = useToggleWishlist()

  const [heroSearch, setHeroSearch] = useState('')

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      setSearch(heroSearch.trim())
      navigate('/courses')
    }
  }

  const ratingStr = isAr ? '٤٫٩ / ٥٫٠' : '4.9 / 5.0'

  return (
    <div className="w-full flex flex-col gap-14 sm:gap-20 pb-20 overflow-hidden">
      {/* 1. HERO SECTION (Full Width) */}
      <section className="relative w-full pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden border-b border-border bg-gradient-to-b from-primary-light/40 via-background to-background">
        {/* Soft Background Ambient Glows */}
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Column: Hero Content & CTAs */}
            <div className={`lg:col-span-7 flex flex-col items-start ${isAr ? 'text-right' : 'text-left'}`}>
              <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-text-main tracking-tight leading-[1.2] mb-6">
                {t('home.heroTitlePrefix')}{' '}
                <HighlightedText variant="wavy" color="primary">
                  <span className="text-gradient-brand">{t('home.heroTitleHighlight')}</span>
                </HighlightedText>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-text-muted leading-relaxed mb-8 max-w-2xl">
                {t('home.heroDescription')}
              </p>

              {/* Search Bar Input */}
              <form onSubmit={handleHeroSearch} className="w-full max-w-2xl mb-8">
                <div className="relative flex items-center bg-surface border-2 border-border focus-within:border-primary rounded-2xl p-1.5 shadow-md shadow-primary/5 transition-all">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder={t('home.heroSearchPlaceholder')}
                    className="flex-1 px-4 py-2 bg-transparent text-sm sm:text-base font-medium text-text-main placeholder:text-text-subtle focus:outline-none"
                  />
                  <Button type="submit" size="md" icon={<IconSearch size={18} />}>
                    {t('home.heroSearchBtn')}
                  </Button>
                </div>
              </form>

              {/* Dual Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <Button
                  size="lg"
                  onClick={() => navigate(isAuthenticated ? '/courses' : '/register')}
                  iconRight={isAr ? <IconArrowLeft size={18} /> : <IconArrowRight size={18} />}
                >
                  {isAuthenticated ? t('home.exploreCourses') : t('home.startLearningFree')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/courses')}
                  icon={<IconPlayerPlay size={18} className="text-primary" />}
                >
                  {t('home.browseAllCourses')}
                </Button>
              </div>

              {/* Student Trust Strip */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-border/80 w-full max-w-xl">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-surface object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-surface object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-surface object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                  <img
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-surface object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Student"
                  />
                </div>
                <div className="text-xs text-text-muted">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <IconStarFilled size={13} />
                    <IconStarFilled size={13} />
                    <IconStarFilled size={13} />
                    <IconStarFilled size={13} />
                    <IconStarFilled size={13} />
                    <span className="text-text-main mr-1 font-bold">{ratingStr}</span>
                  </div>
                  <span className="font-medium">
                    {t('home.studentTrustCount')}
                  </span>
                </div>
              </div>
            </div>

            {/* Column: 3D Brand Artwork & Badges */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Main 3D Hero Artwork */}
                <div className="bg-surface border border-border rounded-3xl p-3 shadow-2xl relative z-10 overflow-hidden group">
                  <img
                    src="/assets/brand/hero_edtech_3d.jpg"
                    alt="EduAcademy Platform"
                    className="w-full aspect-[4/3] object-cover rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Floating Widget 1 */}
                <div className="absolute -top-4 -right-4 sm:-right-6 z-20 animate-bounce duration-1000 shadow-xl">
                  <BrandBadgeSticker
                    type="certificate"
                    tone="emerald"
                    size="md"
                    label={isAr ? 'شهادة معتمدة' : 'Verified Certificate'}
                  />
                </div>

                {/* Floating Widget 2 */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 z-20 shadow-xl">
                  <BrandBadgeSticker
                    type="ai"
                    tone="accent"
                    size="md"
                    label={isAr ? 'مسارات ذكاء اصطناعي' : 'AI-Powered Learning'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR COURSES SECTION */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary uppercase tracking-wider mb-2">
              <SparkleAccent size={15} color="#2563EB" />
              <span>{t('home.popularCoursesBadge')}</span>
            </div>
            <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-text-main tracking-tight m-0">
              {t('home.popularCoursesTitle')}
            </h2>
            <p className="text-sm sm:text-base text-text-muted mt-1 mb-0 max-w-2xl">
              {t('home.popularCoursesSubtitle')}
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition-colors no-underline group self-start sm:self-end"
          >
            <span>{t('home.browseAllCourses')}</span>
            {isAr ? (
              <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            ) : (
              <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </div>

        <CourseGrid
          courses={featured.data ?? []}
          loading={featured.isLoading}
          skeletonCount={4}
          columns={4}
          onToggleWishlist={isAuthenticated ? (slug) => toggleWishlist.mutate(slug) : undefined}
          emptyTitle={t('home.emptyCoursesTitle')}
          emptyDescription={t('home.emptyCoursesDesc')}
        />
      </section>

      {/* 3. EXPLORE BY CATEGORY */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-secondary uppercase tracking-wider mb-2">
              <SparkleAccent size={15} color="#7C3AED" />
              <span>{t('home.categoriesBadge')}</span>
            </div>
            <h2 className="font-heading text-xl sm:text-3xl md:text-4xl font-black text-text-main tracking-tight m-0">
              {t('home.categoriesTitle')}
            </h2>
            <p className="text-sm sm:text-base text-text-muted mt-1 mb-0 max-w-2xl">
              {t('home.categoriesSubtitle')}
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-secondary hover:text-secondary-hover transition-colors no-underline group self-start sm:self-end"
          >
            <span>{t('common.viewAll')}</span>
            {isAr ? (
              <IconArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            ) : (
              <IconArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
        </div>

        <CategoryGrid categories={categories.data ?? []} loading={categories.isLoading} limit={8} />
      </section>

      {/* 4. HIGH-CONVERSION FINAL CTA BANNER */}
      <section className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="relative rounded-3xl bg-gradient-brand p-8 sm:p-16 text-white shadow-xl overflow-hidden text-center flex flex-col items-center">
          {/* Ambient decorative circles */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="font-heading text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {t('home.ctaTitle')}
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-blue-100 leading-relaxed mb-8 max-w-xl">
              {t('home.ctaDescription')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? '/courses' : '/register')}
                className="px-8 py-4 rounded-2xl font-black text-sm sm:text-base bg-white text-primary hover:bg-blue-50 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>
                  {isAuthenticated ? t('home.exploreCourses') : t('home.ctaPrimaryBtn')}
                </span>
                {isAr ? <IconArrowLeft size={16} /> : <IconArrowRight size={16} />}
              </button>

              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-7 py-4 rounded-2xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-pointer"
              >
                {t('home.ctaSecondaryBtn')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
