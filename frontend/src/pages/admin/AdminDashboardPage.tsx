import {
  IconArrowRight,
  IconCash,
  IconCategory,
  IconChevronRight,
  IconEye,
  IconFilePencil,
  IconSchool,
  IconShieldCheck,
  IconShoppingCart,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { StarRating } from '@/components/molecules/StarRating'
import { StatTile } from '@/components/molecules/StatTile'

import { AttentionPanel, type AttentionItem } from '@/components/organisms/dashboard/AttentionPanel'
import { DashboardSection } from '@/components/organisms/dashboard/DashboardSection'
import { QuickActions, type QuickAction } from '@/components/organisms/dashboard/QuickActions'
import { SparkChart } from '@/components/organisms/SparkChart'
import { PageHeader } from '@/components/templates/PageHeader'
import { useAdminDashboard } from '@/features/dashboard/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard(30)
  const { t, tPlural, isAr, formatMoney, formatNumber } = useTranslation()

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />
  if (!data) return null

  const { stats, charts, top_instructors: instructors, featured_courses: featured } = data

  const attention: AttentionItem[] = [
    {
      id: 'review',
      label: t('dash.coursesInReview'),
      count: stats.courses.pending_review,
      to: '/admin/orders',
      icon: <IconEye size={20} />,
      tone: 'danger',
    },
    {
      id: 'drafts',
      label: t('dash.draftCourses'),
      count: stats.courses.draft,
      to: '/admin/users?role=instructor',
      icon: <IconFilePencil size={20} />,
      tone: 'warning',
    },
  ]

  const quickActions: QuickAction[] = [
    { label: t('dash.manageUsers'), to: '/admin/users', icon: <IconUsers size={20} />, tone: 'primary' },
    {
      label: t('dash.manageCategories'),
      to: '/admin/categories',
      icon: <IconCategory size={20} />,
      tone: 'accent',
    },
    {
      label: t('dash.reviewOrders'),
      to: '/admin/orders',
      icon: <IconShoppingCart size={20} />,
      tone: 'secondary',
    },
    { label: t('dash.browseCourses'), to: '/courses', icon: <IconSchool size={20} />, tone: 'success' },
  ]

  return (
    <div className="flex flex-col gap-7 sm:gap-9 pb-12">
      <PageHeader
        pretitle={isAr ? 'لوحة القيادة الإدارية' : 'Platform Administration'}
        title={t('dash.adminOverview')}
        description={
          isAr
            ? 'مؤشرات أداء المنصة الشاملة: نمو المستخدمين، كتالوج الدورات، النشاط الأكاديمي، والإيرادات الإجمالية.'
            : 'Platform-wide analytics: user growth cohorts, catalog health, active enrollments, and gross platform revenue.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.admin') }]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/users" className="no-underline">
              <Button variant="outline" size="sm" icon={<IconUsers size={15} />}>
                {t('dash.manageUsers')}
              </Button>
            </Link>
            <Link to="/admin/orders" className="no-underline">
              <Button size="sm" icon={<IconShoppingCart size={15} />}>
                {t('dash.reviewOrders')}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Admin Executive Overview Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 sm:p-8 text-white shadow-xl overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white/10">
        <div className="absolute top-0 end-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] sm:text-xs font-bold text-cyan-200 mb-3 shadow-2xs border border-white/10">
            <IconShieldCheck size={14} className="text-emerald-400" />
            <span>{isAr ? 'مركز التحكم والرقابة الإدارية' : 'Executive Operations Center'}</span>
          </div>

          <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight m-0 mb-2 leading-tight">
            {isAr ? 'نظام المنصة التعليمية يعمل بكفاءة كاملة' : 'Platform Operations & Intelligence'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed m-0">
            {isAr
              ? `إجمالي المستخدمين المسجلين: ${formatNumber(stats.users.total)} مستخدم، مع تحقيق ${formatMoney(stats.revenue_cents, stats.currency)} إجمالي إيرادات.`
              : `Managing ${formatNumber(stats.users.total)} registered platform accounts across ${formatNumber(stats.courses.published)} active courses with ${formatMoney(stats.revenue_cents, stats.currency)} gross volume.`}
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link to="/admin/categories" className="no-underline">
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              icon={<IconCategory size={16} />}
            >
              {t('dash.manageCategories')}
            </Button>
          </Link>
          <Link to="/admin/users" className="no-underline">
            <Button size="md" className="bg-white text-slate-900 hover:bg-slate-100 border-0 shadow-md font-black" iconRight={<IconArrowRight size={16} />}>
              {t('dash.manageUsers')}
            </Button>
          </Link>
        </div>
      </div>

      <DashboardSection title={t('dash.needsAttention')}>
        <AttentionPanel items={attention} />
      </DashboardSection>

      {/* Primary KPI Tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <StatTile
          label={t('dash.totalUsers')}
          value={formatNumber(stats.users.total)}
          icon={<IconUsers size={20} />}
          hint={`${formatNumber(stats.users.students)} ${isAr ? 'طالب' : 'students'} · ${formatNumber(stats.users.instructors)} ${isAr ? 'مدرّب' : 'instructors'}`}
          tone="primary"
        />
        <StatTile
          label={`${t('dash.newThisMonth')} — ${t('dash.thisMonth')}`}
          value={formatNumber(stats.users.new_this_month)}
          tone="info"
          icon={<IconUserPlus size={20} />}
        />
        <StatTile
          label={t('dash.publishedCourses')}
          value={formatNumber(stats.courses.published)}
          tone="warning"
          icon={<IconSchool size={20} />}
          hint={`${formatNumber(stats.courses.draft)} ${t('common.draft')}`}
        />
        <StatTile
          label={t('dash.grossRevenue')}
          value={formatMoney(stats.revenue_cents, stats.currency)}
          tone="success"
          icon={<IconCash size={20} />}
        />
      </div>

      <DashboardSection title={t('dash.quickActions')}>
        <QuickActions actions={quickActions} />
      </DashboardSection>

      {/* Analytics Charts */}
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
        {/* Top instructors */}
        <div className="xl:col-span-5 bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                {t('dash.topInstructors')}
              </h2>
            </div>
            <Link
              to="/admin/users?role=instructor"
              className="text-xs font-bold text-primary hover:underline no-underline shrink-0 inline-flex items-center gap-1"
            >
              <span>{t('common.viewAll')}</span>
              <IconChevronRight size={14} className={isAr ? 'rotate-180' : ''} />
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-border p-2">
            {instructors.map((instructor) => (
              <div
                key={instructor.id}
                className="p-3.5 flex items-center gap-3.5 hover:bg-surface-hover/50 rounded-2xl transition-colors"
              >
                <Avatar name={instructor.name} src={instructor.avatar_url} size="sm" />

                <div className="flex-1 min-w-0">
                  <span className="block font-bold text-xs sm:text-sm text-text-main truncate">
                    {instructor.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {tPlural(instructor.courses_count ?? 0, 'courses')}
                  </span>
                </div>

                <span className="tabular-nums text-xs font-black text-text-main shrink-0 text-end">
                  {tPlural(instructor.students_total ?? 0, 'students')}
                </span>
              </div>
            ))}

            {instructors.length === 0 ? (
              <p className="text-center text-text-muted py-12 text-xs sm:text-sm m-0">
                {t('dash.noInstructors')}
              </p>
            ) : null}
          </div>
        </div>

        {/* Featured courses */}
        <div className="xl:col-span-7 bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border bg-surface-muted/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                {t('dash.featuredCourses')}
              </h2>
            </div>
            <Link
              to="/courses"
              className="text-xs font-bold text-primary hover:underline no-underline shrink-0 inline-flex items-center gap-1"
            >
              <span>{t('common.viewAll')}</span>
              <IconChevronRight size={14} className={isAr ? 'rotate-180' : ''} />
            </Link>
          </div>

          {/* Mobile cards */}
          <ul className="sm:hidden list-none m-0 p-3 flex flex-col gap-2">
            {featured.map((course) => (
              <li key={course.id} className="p-3.5 rounded-2xl bg-surface-muted/30 border border-border/60 hover:bg-surface-hover/60 transition-colors">
                <Link
                  to={`/courses/${course.slug}`}
                  className="font-bold text-sm text-text-main hover:text-primary no-underline line-clamp-2 block mb-1.5"
                >
                  {course.title}
                </Link>

                <div className="flex items-center justify-between text-xs text-text-muted tabular-nums">
                  <span className="font-semibold">
                    {formatNumber(course.students_count)} {t('home.statStudents')}
                  </span>
                  {course.rating.count > 0 ? (
                    <StarRating value={course.rating.average} size={12} showValue />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                  <th className="py-3.5 px-5 text-start">{t('dash.courseTitle')}</th>
                  <th className="py-3.5 px-5 text-start">{t('home.statStudents')}</th>
                  <th className="py-3.5 px-5 text-start">{t('courses.rating')}</th>
                  <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {featured.map((course) => (
                  <tr key={course.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="font-bold text-text-main hover:text-primary transition-colors no-underline line-clamp-1 max-w-sm"
                      >
                        {course.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                      {formatNumber(course.students_count)}
                    </td>
                    <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                      {course.rating.count > 0 ? (
                        <StarRating value={course.rating.average} size={13} showValue />
                      ) : (
                        <span className="text-xs text-text-subtle">{t('courses.noReviewsYet')}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-end">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover inline-flex items-center gap-1 text-xs font-bold no-underline"
                      >
                        <IconEye size={14} />
                        <span>{isAr ? 'معاينة' : 'Preview'}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

