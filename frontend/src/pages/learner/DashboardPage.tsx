import {
  IconAward,
  IconBook,
  IconCertificate,
  IconCheck,
  IconChalkboard,
  IconCompass,
  IconExternalLink,
  IconHeart,
  IconPlayerPlay,
  IconProgressCheck,
  IconSchool,
  IconSettings,
  IconShieldLock,
  IconSparkles,
  IconTrendingUp,
} from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'


import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { StatTile } from '@/components/molecules/StatTile'
import { CourseCard } from '@/components/organisms/CourseCard'
import { AttentionPanel, type AttentionItem } from '@/components/organisms/dashboard/AttentionPanel'
import { DashboardSection } from '@/components/organisms/dashboard/DashboardSection'
import { QuickActions, type QuickAction } from '@/components/organisms/dashboard/QuickActions'
import { useStudentDashboard } from '@/features/dashboard/hooks'
import { useTranslation } from '@/shared/lib/i18n'
import { useCanTeach, useCurrentUser, useIsAdmin } from '@/stores/authStore'

export function DashboardPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const canTeach = useCanTeach()
  const isAdmin = useIsAdmin()

  const { data, isLoading } = useStudentDashboard()
  const { t, isAr, formatNumber, formatPercent, formatDate } = useTranslation()

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />
  if (!data) return null

  const { stats, continue_learning: continueLearning, recent_certificates: certificates } = data

  const resumeCourse = continueLearning.find((enrollment) => enrollment.course)?.course ?? null
  const unclaimedCertificates = Math.max(0, stats.completed - stats.certificates)

  const attention: AttentionItem[] = [
    {
      id: 'unfinished',
      label: t('dash.unfinishedCourses'),
      count: stats.in_progress,
      to: '/my-learning',
      icon: <IconProgressCheck size={20} />,
      tone: 'warning',
    },
    {
      id: 'certificates',
      label: t('dash.claimCertificate'),
      count: unclaimedCertificates,
      to: '/my-learning',
      icon: <IconCertificate size={20} />,
      tone: 'success',
    },
  ]

  const quickActions: QuickAction[] = [
    { label: t('dash.browseCourses'), to: '/courses', icon: <IconCompass size={20} />, tone: 'primary' },
    { label: t('dash.myLearning'), to: '/my-learning', icon: <IconSchool size={20} />, tone: 'accent' },
    { label: t('dash.wishlist'), to: '/wishlist', icon: <IconHeart size={20} />, tone: 'secondary' },
    ...(canTeach
      ? [
          {
            label: t('dash.teachOverview'),
            to: '/teach',
            icon: <IconChalkboard size={20} />,
            tone: 'success' as const,
          },
        ]
      : [{ label: t('dash.settings'), to: '/settings', icon: <IconSettings size={20} />, tone: 'success' as const }]),
    ...(isAdmin
      ? [
          {
            label: t('dash.adminOverview'),
            to: '/admin',
            icon: <IconShieldLock size={20} />,
            tone: 'secondary' as const,
          },
        ]
      : []),
  ]

  const avgProgress = Math.round(stats.average_progress ?? 0)

  return (
    <div className="flex flex-col gap-7 sm:gap-9 pb-12">
      {/* Premium Hero Welcome Banner — Balanced for Mobile, Tablet & Desktop */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-950 dark:to-purple-950 p-6 sm:p-8 md:p-9 text-white shadow-xl overflow-hidden border border-white/10">
        {/* Ambient Glows */}
        <div className="absolute top-0 end-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-1/3 w-64 h-64 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Welcome Text & Progress */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] sm:text-xs font-bold text-cyan-100 w-fit shadow-2xs border border-white/10">
              <IconSparkles size={14} className="text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{t('dashboard.welcomeBack')}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight m-0 leading-tight">
              {isAr
                ? `أهلاً، ${user?.name.split(' ')[0] ?? 'طالبنا المميز'}`
                : `Hello, ${user?.name.split(' ')[0] ?? 'there'}`}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed m-0 max-w-xl">
              {isAr
                ? `أنت تحرز تقدماً رائعاً! أكملت متوسط ${formatPercent(stats.average_progress ?? 0)} من مساراتك التعليمية.`
                : `You're making steady progress — averaging ${formatPercent(stats.average_progress ?? 0)} completion across all enrolled tracks.`}
            </p>

            {/* Progress telemetry bar inside hero */}
            <div className="mt-2 max-w-md w-full">
              <div className="flex items-center justify-between text-xs text-blue-100 font-bold mb-1.5">
                <span>{t('dash.avgProgress')}</span>
                <span className="font-mono text-cyan-200">{avgProgress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-xs">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${avgProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions & Metric Card on Tablet/Desktop */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3 items-stretch justify-center md:items-end">
            {resumeCourse ? (
              <Button
                size="md"
                className="bg-white text-primary hover:bg-blue-50 border-0 shadow-lg font-black w-full sm:w-auto md:w-full justify-center"
                onClick={() => navigate(`/learn/${resumeCourse.slug}`)}
                iconRight={<IconPlayerPlay size={16} />}
              >
                {t('dashboard.resumeLearning')}
              </Button>
            ) : null}

            <Button
              variant="outline"
              size="md"
              className="bg-white/10 border-white/25 text-white hover:bg-white/20 backdrop-blur-sm w-full sm:w-auto md:w-full justify-center font-bold"
              onClick={() => navigate('/courses')}
            >
              {t('dash.browseCourses')}
            </Button>
          </div>
        </div>
      </div>

      {/* What needs you */}
      <DashboardSection title={t('dash.needsAttention')}>
        <AttentionPanel items={attention} />
      </DashboardSection>


      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        <StatTile
          label={t('dashboard.enrolledCourses')}
          value={formatNumber(stats.enrolled)}
          icon={<IconBook size={20} />}
          tone="primary"
        />
        <StatTile
          label={t('dashboard.inProgressCourses')}
          value={formatNumber(stats.in_progress)}
          tone="warning"
          icon={<IconTrendingUp size={20} />}
        />
        <StatTile
          label={t('dashboard.completedCourses')}
          value={formatNumber(stats.completed)}
          tone="success"
          icon={<IconCheck size={20} />}
        />
        <StatTile
          label={t('dashboard.earnedCertificates')}
          value={formatNumber(stats.certificates)}
          tone="info"
          icon={<IconCertificate size={20} />}
          hint={`${t('dash.avgProgress')}: ${formatPercent(stats.average_progress ?? 0)}`}
        />
      </div>

      {/* Quick actions */}
      <DashboardSection title={t('dash.quickActions')}>
        <QuickActions actions={quickActions} />
      </DashboardSection>

      {/* Continue learning */}
      <DashboardSection
        title={t('dash.continueWhereLeft')}
        description={
          isAr
            ? 'عد مباشرة إلى دروسك واختباراتك المتبقية وأكمل مسارك التعليمي.'
            : 'Jump straight back into your lessons, quizzes, and practical assignments.'
        }
        action={{ label: t('dashboard.viewAllCourses'), to: '/my-learning' }}
      >
        {continueLearning.length === 0 ? (
          <EmptyState
            icon={<IconBook size={36} stroke={1.5} />}
            title={isAr ? 'لا توجد كورسات قيد التقدم حالياً' : 'Nothing in progress yet'}
            description={
              isAr
                ? 'سجّل في أحد الكورسات المتاحة لبدء رحلتك التعليمية واكتساب مهارات جديدة.'
                : 'Enrol in a course to start your learning journey.'
            }
            action={
              <Link to="/courses" className="no-underline">
                <Button size="sm" icon={<IconCompass size={15} />}>
                  {t('dash.browseCourses')}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
            {continueLearning.map((enrollment) =>
              enrollment.course ? (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  progressPercent={enrollment.progress_percent}
                  href={`/learn/${enrollment.course.slug}`}
                  footer={
                    <Link to={`/learn/${enrollment.course.slug}`} className="no-underline block w-full">
                      <Button fullWidth size="sm" iconRight={<IconPlayerPlay size={14} />}>
                        {enrollment.progress_percent > 0
                          ? t('courses.continueLearning')
                          : t('courses.startCourse')}
                      </Button>
                    </Link>
                  }
                />
              ) : null,
            )}
          </div>
        )}
      </DashboardSection>

      {/* Certificates */}
      {certificates.length > 0 ? (
        <DashboardSection
          title={t('dash.certificates')}
          description={
            isAr
              ? 'شهاداتك المعتمدة مع إمكانية التحقق والمشاركة الفورية.'
              : 'Your verified credentials, each with a shareable verification link.'
          }
          action={{ label: t('common.viewAll'), to: '/certificates' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                className="group relative overflow-hidden bg-surface/90 backdrop-blur-md border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="absolute top-0 end-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                <div className="relative z-10 flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs group-hover:scale-105 transition-transform">
                    <IconAward size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-text-main truncate mb-1">
                      {certificate.course_title}
                    </h3>
                    <p className="text-xs text-text-muted m-0">{formatDate(certificate.issued_at)}</p>
                    <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-surface-muted text-text-muted text-[10px] font-mono font-bold border border-border">
                      {certificate.serial}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/certificates/verify/${certificate.serial}`}
                  className="relative z-10 no-underline block w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<IconExternalLink size={14} />}
                    className="border-emerald-500/30 hover:bg-emerald-50 text-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                  >
                    {isAr ? 'معاينة ومشاركة الوثيقة' : 'View Credential'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </DashboardSection>
      ) : null}
    </div>
  )
}

