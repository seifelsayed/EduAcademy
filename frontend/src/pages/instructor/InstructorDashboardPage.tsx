import {
  IconCash,
  IconChevronRight,
  IconClipboardList,
  IconEdit,
  IconEye,
  IconFilePencil,
  IconPlus,
  IconSchool,
  IconSparkles,
  IconStar,
  IconUsers,
} from '@tabler/icons-react'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { StarRating } from '@/components/molecules/StarRating'
import { StatTile } from '@/components/molecules/StatTile'
import { AttentionPanel, type AttentionItem } from '@/components/organisms/dashboard/AttentionPanel'
import { DashboardSection } from '@/components/organisms/dashboard/DashboardSection'
import { QuickActions, type QuickAction } from '@/components/organisms/dashboard/QuickActions'
import { SparkChart } from '@/components/organisms/SparkChart'
import { PageHeader } from '@/components/templates/PageHeader'
import { useInstructorDashboard } from '@/features/dashboard/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCurrentUser } from '@/stores/authStore'

export function InstructorDashboardPage() {
  const user = useCurrentUser()
  const { data, isLoading } = useInstructorDashboard(30)
  const { t, isAr, formatMoney, formatNumber, formatRelative } = useTranslation()

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />
  if (!data) return null

  const { stats, charts, top_courses: topCourses, recent_reviews: reviews } = data

  const attention: AttentionItem[] = [
    {
      id: 'grading',
      label: t('dash.pendingGrading'),
      count: stats.pending_submissions,
      to: '/teach/grading',
      icon: <IconClipboardList size={20} />,
      tone: 'danger',
    },
    {
      id: 'drafts',
      label: t('dash.draftCourses'),
      count: stats.draft,
      to: '/teach/courses',
      icon: <IconFilePencil size={20} />,
      tone: 'warning',
    },
    {
      id: 'review',
      label: t('dash.coursesInReview'),
      count: stats.pending_review,
      to: '/teach/courses',
      icon: <IconEye size={20} />,
      tone: 'info',
    },
  ]

  const quickActions: QuickAction[] = [
    { label: t('dash.newCourse'), to: '/teach/courses/new', icon: <IconPlus size={20} />, tone: 'primary' },
    { label: t('dash.myTaughtCourses'), to: '/teach/courses', icon: <IconSchool size={20} />, tone: 'accent' },
    {
      label: t('dash.gradingQueue'),
      to: '/teach/grading',
      icon: <IconClipboardList size={20} />,
      tone: 'secondary',
    },
    { label: t('dash.myLearning'), to: '/my-learning', icon: <IconEdit size={20} />, tone: 'success' },
  ]

  return (
    <div className="flex flex-col gap-7 sm:gap-9 pb-12">
      <PageHeader
        pretitle={isAr ? 'لوحة تحكم المدرّب' : 'Instructor Studio'}
        title={t('dash.teachOverview')}
        description={
          isAr
            ? 'مؤشرات أداء دوراتك التدريبية، الطلاب المسجلين، والإيرادات المحققة خلال آخر ٣٠ يوماً.'
            : 'Track teaching performance metrics, active learner cohorts, and gross earnings over the past 30 days.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.teach') }]}
        actions={
          <Link to="/teach/courses/new" className="no-underline">
            <Button size="sm" icon={<IconPlus size={15} />}>
              {t('dash.newCourse')}
            </Button>
          </Link>
        }
      />

      {/* Instructor Executive Performance Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 p-6 sm:p-8 text-white shadow-lg overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="absolute top-0 end-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] sm:text-xs font-bold text-purple-100 mb-3 shadow-2xs">
            <IconSparkles size={14} className="text-amber-300" />
            <span>{isAr ? 'مركز إدارة المحاضر' : 'Instructor Analytics'}</span>
          </div>

          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight m-0 mb-2 leading-tight">
            {isAr
              ? `مرحباً أستاذ ${user?.name.split(' ')[0] ?? ''}`
              : `Welcome back, ${user?.name.split(' ')[0] ?? 'Instructor'}`}
          </h2>

          <p className="text-xs sm:text-sm text-purple-100 leading-relaxed m-0">
            {isAr
              ? `لديك ${formatNumber(stats.students)} طالب مسجل عبر دوراتك، بإجمالي أرباح ${formatMoney(stats.revenue_cents, stats.currency)}.`
              : `You are mentoring ${formatNumber(stats.students)} enrolled students with ${formatMoney(stats.revenue_cents, stats.currency)} in earned course revenue.`}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link to="/teach/courses" className="no-underline">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              icon={<IconSchool size={16} />}
            >
              {t('dash.myTaughtCourses')}
            </Button>
          </Link>
          <Link to="/teach/courses/new" className="no-underline">
            <Button size="md" className="bg-white text-purple-700 hover:bg-purple-50 border-0 shadow-md font-black" iconRight={<IconPlus size={16} />}>
              {t('dash.newCourse')}
            </Button>
          </Link>
        </div>
      </div>

      <DashboardSection title={t('dash.needsAttention')}>
        <AttentionPanel items={attention} />
      </DashboardSection>

      {/* KPI Metric Tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <StatTile
          label={t('dash.publishedCourses')}
          value={formatNumber(stats.published)}
          hint={`${formatNumber(stats.draft)} ${t('common.draft')}`}
          icon={<IconSchool size={20} />}
          tone="primary"
        />
        <StatTile
          label={t('dash.studentsTotal')}
          value={formatNumber(stats.students)}
          tone="info"
          icon={<IconUsers size={20} />}
        />
        <StatTile
          label={t('dash.earnings')}
          value={formatMoney(stats.revenue_cents, stats.currency)}
          tone="success"
          icon={<IconCash size={20} />}
        />
        <StatTile
          label={t('dash.avgRating')}
          value={
            stats.average_rating > 0
              ? isAr
                ? formatNumber(parseFloat(stats.average_rating.toFixed(2)))
                : stats.average_rating.toFixed(2)
              : '—'
          }
          tone="warning"
          icon={<IconStar size={20} />}
        />
      </div>

      <DashboardSection title={t('dash.quickActions')}>
        <QuickActions actions={quickActions} />
      </DashboardSection>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <ChartCard title={`${t('dash.dailyEnrollments')} — ${t('dash.last30Days')}`}>
          <SparkChart series={charts.enrollments} label={t('dash.dailyEnrollments')} />
        </ChartCard>

        <ChartCard title={`${t('dash.dailyRevenue')} — ${t('dash.last30Days')}`}>
          <SparkChart
            series={charts.revenue}
            tone="var(--color-primary)"
            label={t('dash.dailyRevenue')}
            formatValue={(value) => formatMoney(value, stats.currency)}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Top courses */}
        <div className="xl:col-span-7 bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-sm sm:text-base font-black text-text-main m-0">{t('dash.topCourses')}</h2>
            </div>
            <Link
              to="/teach/courses"
              className="text-xs font-bold text-primary hover:underline no-underline shrink-0 inline-flex items-center gap-1"
            >
              <span>{t('common.viewAll')}</span>
              <IconChevronRight size={14} className={isAr ? 'rotate-180' : ''} />
            </Link>
          </div>

          {topCourses.length === 0 ? (
            <p className="text-center text-text-muted py-12 px-4 text-xs sm:text-sm m-0">
              {t('dash.noCoursesYet')}
            </p>
          ) : (
            <>
              {/* Phones: stacked cards */}
              <ul className="md:hidden list-none m-0 p-3 flex flex-col gap-2">
                {topCourses.map((course) => (
                  <li
                    key={course.id}
                    className="p-3.5 rounded-2xl bg-surface-muted/30 border border-border/60 hover:bg-surface-hover/60 transition-colors"
                  >
                    <Link
                      to={`/teach/courses/${course.slug}`}
                      className="font-bold text-sm text-text-main hover:text-primary no-underline line-clamp-2 block mb-2"
                    >
                      {course.title}
                    </Link>

                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-text-muted">
                      <Badge tone={course.status === 'published' ? 'success' : 'warning'}>
                        {t(`common.${course.status}`)}
                      </Badge>
                      <span className="tabular-nums font-semibold">
                        {formatNumber(course.students_count)} · {t('home.statStudents')}
                      </span>
                      {course.rating.count > 0 ? (
                        <StarRating value={course.rating.average} size={12} showValue />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                      <th className="py-3.5 px-5 text-start">{t('dash.courseTitle')}</th>
                      <th className="py-3.5 px-5 text-start">{t('home.statStudents')}</th>
                      <th className="py-3.5 px-5 text-start">{t('courses.rating')}</th>
                      <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                      <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {topCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <Link
                            to={`/teach/courses/${course.slug}`}
                            className="font-bold text-text-main hover:text-primary transition-colors no-underline line-clamp-1 max-w-xs"
                          >
                            {course.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                          {formatNumber(course.students_count)}
                        </td>
                        <td className="py-3.5 px-5">
                          {course.rating.count > 0 ? (
                            <StarRating value={course.rating.average} size={13} showValue />
                          ) : (
                            <span className="text-xs text-text-subtle">{t('courses.noReviewsYet')}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge tone={course.status === 'published' ? 'success' : 'warning'}>
                            {t(`common.${course.status}`)}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-end">
                          <Link
                            to={`/teach/courses/${course.slug}`}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover inline-flex items-center gap-1 text-xs font-bold no-underline"
                          >
                            <IconEdit size={14} />
                            <span>{t('common.edit')}</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Recent reviews */}
        <div className="xl:col-span-5 bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                {t('dash.recentReviews')}
              </h2>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border p-2">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3.5 flex gap-3.5 hover:bg-surface-hover/40 rounded-2xl transition-colors"
              >
                <Avatar
                  name={review.author?.name ?? (isAr ? 'طالب' : 'Learner')}
                  src={review.author?.avatar_url}
                  size="sm"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-xs text-text-main truncate">
                      {review.author?.name ?? (isAr ? 'طالب' : 'Learner')}
                    </span>
                    <StarRating value={review.rating} size={11} showValue={false} />
                  </div>

                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-1">
                    {review.comment ?? review.title ?? (isAr ? 'بدون تعليق مكتوب' : 'No written comment')}
                  </p>

                  <span className="text-[10px] text-text-subtle font-mono">{formatRelative(review.created_at)}</span>
                </div>
              </div>
            ))}

            {reviews.length === 0 ? (
              <p className="text-center text-text-muted py-12 text-xs sm:text-sm m-0">
                {t('dash.noReviewsYet')}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-4">
      <h2 className="text-sm sm:text-base font-black text-text-main m-0 tracking-tight">{title}</h2>
      {children}
    </div>
  )
}

