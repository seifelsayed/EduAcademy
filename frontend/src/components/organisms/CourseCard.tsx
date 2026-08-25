import {
  IconBook,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconPlayerPlay,
  IconUsers,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { StarRating } from '@/components/molecules/StarRating'
import type { Course } from '@/core/domain/schemas/catalog'
import { getLocalizedCourse } from '@/features/catalog/localizedCatalog'
import { getCourseThumbnail } from '@/shared/lib/courseAssets'
import { useTranslation } from '@/shared/lib/i18n'

interface CourseCardProps {
  course: Course
  progressPercent?: number
  onToggleWishlist?: (slug: string) => void
  href?: string
  footer?: ReactNode
}

export function CourseCard({
  course: rawCourse,
  progressPercent,
  onToggleWishlist,
  href,
  footer,
}: CourseCardProps) {
  const { t, tPlural, isAr, language, formatDuration, formatCompact, formatPercent, formatMoney } = useTranslation()
  const course = getLocalizedCourse(rawCourse, language)
  const target = href ?? `/courses/${course.slug}`
  const isLearning = progressPercent !== undefined
  const thumbnail = getCourseThumbnail(course)

  return (
    <article className="group flex flex-col h-full bg-surface border border-border hover:border-primary/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative">
      {/* 1. Thumbnail Media Banner with Overlays */}
      <Link to={target} className="block relative w-full aspect-video overflow-hidden bg-surface-muted no-underline select-none border-b border-border">
        <img
          src={thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Ambient bottom gradient for tag readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Discount Badge */}
        {course.price.discount_percent > 0 && !isLearning ? (
          <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wide">
            {isAr ? `خصم ${formatPercent(course.price.discount_percent)}` : `${course.price.discount_percent}% OFF`}
          </span>
        ) : null}

        {/* Level Badge */}
        {course.level ? (
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-white/15">
            {t(`common.level.${course.level}`)}
          </span>
        ) : null}

        {/* Wishlist Heart button (Top Right) */}
        {onToggleWishlist ? (
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-rose-400 hover:bg-black/70 flex items-center justify-center transition-all cursor-pointer border border-white/15 shadow-sm active:scale-90"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleWishlist(course.slug)
            }}
            aria-label={course.is_wishlisted ? t('courses.removeFromWishlist') : t('courses.addToWishlist')}
            aria-pressed={course.is_wishlisted ?? false}
          >
            {course.is_wishlisted ? (
              <IconHeartFilled size={16} className="text-rose-500" />
            ) : (
              <IconHeart size={16} />
            )}
          </button>
        ) : null}
      </Link>

      {/* 2. Card Content Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Category tag */}
        <div className="flex items-center gap-2 mb-2.5">
          {course.category ? (
            <Badge tone="primary">
              {course.category.name}
            </Badge>
          ) : null}
          {course.status !== 'published' ? (
            <Badge tone={course.status === 'draft' ? 'warning' : 'info'}>
              {t(`common.${course.status}`)}
            </Badge>
          ) : null}
        </div>

        {/* Title */}
        <h3 className="font-heading font-black text-base sm:text-lg text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
          <Link to={target} className="text-text-main group-hover:text-primary no-underline">
            {course.title}
          </Link>
        </h3>

        {/* Subtitle / Description */}
        {course.subtitle ? (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-3">
            {course.subtitle}
          </p>
        ) : null}

        {/* Instructor */}
        {course.instructor ? (
          <div className="flex items-center gap-2 mb-3">
            <Avatar name={course.instructor.name} src={course.instructor.avatar_url} size="xs" />
            <span className="text-xs font-semibold text-text-muted truncate">{course.instructor.name}</span>
          </div>
        ) : null}

        {/* Rating Score */}
        <div className="mb-3">
          {course.rating.count > 0 ? (
            <StarRating value={course.rating.average} count={course.rating.count} size={13} />
          ) : (
            <span className="text-xs text-text-subtle">{t('courses.noReviewsYet')}</span>
          )}
        </div>

        {/* Metadata stats row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted pt-3 border-t border-border mb-4">
          <span className="inline-flex items-center gap-1 font-medium">
            <IconBook size={14} className="text-primary" />{' '}
            {tPlural(course.lessons_count, 'lessons')}
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <IconClock size={14} className="text-secondary" /> {formatDuration(course.duration_minutes)}
          </span>
          <span className="inline-flex items-center gap-1 font-medium">
            <IconUsers size={14} className="text-accent" />{' '}
            {formatCompact(course.students_count)} {isAr ? 'طالب' : 'students'}
          </span>
        </div>

        {/* Footer: Price or Progress */}
        <div className="mt-auto pt-2">
          {isLearning ? (
            <div>
              <div className="flex items-center justify-between text-xs text-text-muted font-bold mb-1.5">
                <span>{t('courses.progress')}</span>
                <span className="text-primary font-bold">{formatPercent(Math.round(progressPercent))}</span>
              </div>
              <ProgressBar value={progressPercent} size="sm" />
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2.5">
              <PriceRow
                course={course}
                formatMoney={formatMoney}
                freeText={t('common.free')}
                formatPercent={formatPercent}
                isAr={isAr}
              />
              <Link
                to={target}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all duration-200 no-underline shadow-2xs group/btn shrink-0 whitespace-nowrap"
              >
                <span className="whitespace-nowrap">{t('courses.exploreCourse')}</span>
                <IconPlayerPlay size={12} className="group-hover/btn:translate-x-0.5 rtl:group-hover/btn:-translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          )}

          {footer ? <div className="mt-3 pt-3 border-t border-border">{footer}</div> : null}
        </div>
      </div>
    </article>
  )
}

function PriceRow({
  course,
  formatMoney,
  freeText,
  formatPercent,
  isAr,
}: {
  course: Course
  formatMoney: (cents: number, curr?: string) => string
  freeText: string
  formatPercent?: (n: number) => string
  isAr?: boolean
}) {
  const { price } = course

  if (price.is_free) {
    return <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-heading">{freeText}</span>
  }

  const hasDiscount = price.discount_cents !== null && price.discount_cents < price.amount_cents

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="text-lg font-black text-text-main">
        {formatMoney(price.effective_cents, price.currency)}
      </span>
      {hasDiscount ? (
        <>
          <s className="text-xs text-text-subtle line-through">
            {formatMoney(price.amount_cents, price.currency)}
          </s>
          {price.discount_percent > 0 ? (
            <Badge tone="danger" className="text-[10px] px-1.5 py-0 font-extrabold">
              {isAr && formatPercent ? `خصم ${formatPercent(price.discount_percent)}` : `-${price.discount_percent}%`}
            </Badge>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
