import {
  IconAward,
  IconCheck,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconLanguage,
  IconPlayerPlay,
  IconSignature,
  IconSparkles,
  IconUsers,
} from '@tabler/icons-react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { CourseGrid } from '@/components/organisms/CourseGrid'
import { CurriculumAccordion } from '@/components/organisms/CurriculumAccordion'
import { ReviewSection } from '@/components/organisms/ReviewSection'
import { useCreateOrder } from '@/features/billing/hooks'
import { useCourse } from '@/features/catalog/hooks'
import { getLocalizedCourseOverview } from '@/features/catalog/localizedCatalog'
import { useToggleWishlist } from '@/features/engagement/hooks'
import { useEnroll } from '@/features/learning/hooks'
import { getCourseThumbnail } from '@/shared/lib/courseAssets'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { t, tPlural, isAr, language, formatDuration, formatMoney, formatPercent, formatNumber } = useTranslation()

  const { data: rawData, isLoading, isError } = useCourse(slug)
  const enroll = useEnroll()
  const createOrder = useCreateOrder()
  const toggleWishlist = useToggleWishlist()

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />
  if (isError || !rawData) return <Navigate to="/courses" replace />

  const data = getLocalizedCourseOverview(rawData, language)
  const { course, related, ratingBreakdown } = data
  const isOwner = user !== null && course.instructor?.id === user.id
  const isEnrolled = course.is_enrolled === true
  const isFree = course.price.is_free
  const thumbnail = getCourseThumbnail(course)

  const onPrimaryAction = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${course.slug}` } })
      return
    }

    if (isEnrolled) {
      navigate(`/learn/${course.slug}`)
      return
    }

    if (isFree) {
      enroll.mutate(course.slug)
      return
    }

    createOrder.mutate({ slug: course.slug })
  }

  const primaryLabel = !user
    ? isAr ? 'سجّل الدخول للاشتراك' : 'Sign in to Enroll'
    : isEnrolled
      ? t('courses.continueLearning')
      : isFree
        ? isAr ? 'تسجيل مجاني فوري' : 'Enroll for Free'
        : isAr
          ? `شراء الكورس مقابل ${formatMoney(course.price.effective_cents, course.price.currency)}`
          : `Buy Now for ${formatMoney(course.price.effective_cents, course.price.currency)}`

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 pb-16">
      {/* Course Hero Banner */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {course.category ? (
            <Badge tone="primary">{course.category.name}</Badge>
          ) : null}
          {course.level ? (
            <Badge tone="secondary">{t(`common.level.${course.level}`)}</Badge>
          ) : null}
        </div>

        <h1 className="font-heading text-xl sm:text-2xl lg:text-4xl font-black text-text-main tracking-tight leading-snug mb-3">
          {course.title}
        </h1>

        {course.subtitle ? (
          <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-3xl mb-4">
            {course.subtitle}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-text-muted pt-4 border-t border-border/80">
          {course.instructor ? (
            <div className="flex items-center gap-2">
              <Avatar name={course.instructor.name} src={course.instructor.avatar_url} size="xs" />
              <span className="font-bold text-text-main">{course.instructor.name}</span>
            </div>
          ) : null}

          {course.rating.count > 0 ? (
            <div className="flex items-center gap-1.5 font-bold text-text-main">
              <span className="text-amber-500">★ {isAr ? formatNumber(parseFloat(course.rating.average.toFixed(1))) : course.rating.average.toFixed(1)}</span>
              <span className="text-text-muted font-normal">({tPlural(course.rating.count, 'reviews')})</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1.5">
            <IconUsers size={16} className="text-primary" />
            <span>{tPlural(course.students_count, 'students')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <IconClock size={16} className="text-secondary" />
            <span>{formatDuration(course.duration_minutes)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Details */}
        <div className="order-2 lg:order-1 lg:col-span-8 flex flex-col gap-6">
          {course.description ? (
            <section className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-text-main mb-3">
                {isAr ? 'عن هذه الدورة التدريبية' : 'About This Course'}
              </h2>
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line m-0">
                {course.description}
              </p>
            </section>
          ) : null}

          {course.outcomes && course.outcomes.length > 0 ? (
            <section className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                <IconSparkles size={20} className="text-primary" />
                <span>{t('courses.whatYouWillLearn')}</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
                {course.outcomes.map((outcome: string) => (
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-text-main font-medium" key={outcome}>
                    <IconCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Curriculum Breakdown */}
          <section className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-heading text-lg font-bold text-text-main m-0">{t('courses.courseContent')}</h2>
              <span className="text-xs font-semibold text-text-muted">
                {isAr
                  ? `${formatNumber(course.sections_count)} وحدات · ${tPlural(course.lessons_count, 'lessons')} · ${formatDuration(course.duration_minutes)} إجمالي`
                  : `${course.sections_count} sections · ${course.lessons_count} lessons · ${formatDuration(course.duration_minutes)} total`}
              </span>
            </div>

            {course.sections.length > 0 ? (
              <CurriculumAccordion sections={course.sections} defaultExpanded={false} />
            ) : (
              <p className="text-xs sm:text-sm text-text-muted m-0">
                {isAr ? 'لم يقم المدرس بنشر وحدات المنهج بعد.' : 'No curriculum modules published yet.'}
              </p>
            )}
          </section>

          {course.requirements && course.requirements.length > 0 ? (
            <section className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-text-main mb-3">{t('courses.requirements')}</h2>
              <ul className="flex flex-col gap-2 list-disc list-inside text-xs sm:text-sm text-text-muted m-0 ps-1">
                {course.requirements.map((requirement: string) => (
                  <li key={requirement}>{requirement}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {course.instructor ? (
            <section className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <h2 className="font-heading text-lg font-bold text-text-main mb-4">{t('courses.instructor')}</h2>
              <div className="flex items-start gap-4">
                <Avatar
                  name={course.instructor.name}
                  src={course.instructor.avatar_url}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-text-main mb-0.5">{course.instructor.name}</h3>
                  {course.instructor.headline ? (
                    <p className="text-xs font-semibold text-primary mb-2">{course.instructor.headline}</p>
                  ) : null}
                  {course.instructor.bio ? (
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed m-0">{course.instructor.bio}</p>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          <section className="pt-4 border-t border-border">
            <h2 className="font-heading text-xl font-black text-text-main tracking-tight mb-5">{t('courses.reviews')}</h2>
            <ReviewSection
              slug={course.slug}
              averageRating={course.rating.average}
              ratingCount={course.rating.count}
              breakdown={ratingBreakdown}
              canReview={isEnrolled}
              canReply={isOwner}
            />
          </section>
        </div>

        {/* Sticky Purchase / Action Card */}
        <aside className="order-1 lg:order-2 lg:col-span-4 lg:sticky lg:top-24 w-full">
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl flex flex-col">
            {/* Real Consistent Course Thumbnail */}
            <div className="w-full aspect-video bg-surface-muted relative overflow-hidden border-b border-border">
              <img
                src={thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
                  {isFree ? t('common.free') : formatMoney(course.price.effective_cents, course.price.currency)}
                </span>

                {course.price.discount_percent > 0 ? (
                  <>
                    <s className="text-xs text-text-subtle line-through">
                      {formatMoney(course.price.amount_cents, course.price.currency)}
                    </s>
                    <Badge tone="danger">
                      {isAr ? `خصم ${formatPercent(course.price.discount_percent)}` : `${course.price.discount_percent}% OFF`}
                    </Badge>
                  </>
                ) : null}
              </div>

              {isOwner ? (
                <Button variant="outline" size="md" fullWidth onClick={() => navigate(`/teach/courses/${course.slug}`)}>
                  {isAr ? 'إدارة وتعديل الكورس' : 'Manage Course'}
                </Button>
              ) : (
                <Button
                  fullWidth
                  size="lg"
                  iconRight={<IconPlayerPlay size={18} />}
                  loading={enroll.isPending || createOrder.isPending}
                  onClick={onPrimaryAction}
                >
                  {primaryLabel}
                </Button>
              )}

              {user && !isOwner ? (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={
                    course.is_wishlisted ? (
                      <IconHeartFilled size={16} className="text-rose-500" />
                    ) : (
                      <IconHeart size={16} />
                    )
                  }
                  onClick={() => toggleWishlist.mutate(course.slug)}
                >
                  {course.is_wishlisted ? t('courses.removeFromWishlist') : t('courses.addToWishlist')}
                </Button>
              ) : null}

              <div className="pt-4 border-t border-border">
                <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5">
                  {isAr ? 'ماذا تشمل هذه الدورة؟' : 'What is included?'}
                </span>
                <ul className="flex flex-col gap-2.5 list-none p-0 text-xs text-text-muted m-0">
                  <li className="flex items-center gap-2 font-medium">
                    <IconClock size={16} className="text-primary shrink-0" />
                    <span>
                      {isAr
                        ? `${formatDuration(course.duration_minutes)} من الفيديو المسجل عالي الجودة`
                        : `${formatDuration(course.duration_minutes)} on-demand HD video`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <IconSignature size={16} className="text-primary shrink-0" />
                    <span>
                      {isAr
                        ? `${tPlural(course.lessons_count, 'lessons')} وتطبيقات عملية`
                        : `${course.lessons_count} interactive lessons & assignments`}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <IconAward size={16} className="text-primary shrink-0" />
                    <span>
                      {isAr ? 'شهادة إتمام معتمدة برقم تسلسلي موثق' : 'Accredited certificate of completion'}
                    </span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <IconLanguage size={16} className="text-primary shrink-0" />
                    <span>
                      {isAr
                        ? `اللغة: ${course.language} · المستوى: ${t(`common.level.${course.level}`)}`
                        : `Language: ${course.language} · Level: ${t(`common.level.${course.level}`)}`}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {related && related.length > 0 ? (
        <section className="mt-14 pt-8 border-t border-border">
          <h2 className="font-heading text-xl sm:text-2xl font-black text-text-main tracking-tight mb-6">
            {isAr ? 'كورسات ذات صلة' : 'Related Courses'}
          </h2>
          <CourseGrid courses={related} columns={4} />
        </section>
      ) : null}
    </div>
  )
}
