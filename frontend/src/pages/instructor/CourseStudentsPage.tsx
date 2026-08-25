import { IconSearch, IconUsers } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Enrollment, EnrollmentStatus } from '@/core/domain/schemas/learning'
import { useCourse } from '@/features/catalog/hooks'
import { useCourseRoster } from '@/features/learning/hooks'
import { useTranslation } from '@/shared/lib/i18n'

const STATUS_TONE: Record<EnrollmentStatus, 'success' | 'warning' | 'muted'> = {
  completed: 'success',
  active: 'warning',
  cancelled: 'muted',
  expired: 'muted',
}

export function CourseStudentsPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { t, isAr, formatPercent, formatDate, formatNumber } = useTranslation()

  const { data: courseData } = useCourse(slug)
  const { data, isLoading } = useCourseRoster(slug, page)

  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    if (!search.trim()) return data.items as Enrollment[]

    const query = search.toLowerCase()
    return (data.items as Enrollment[]).filter(
      (enrollment) =>
        Boolean(enrollment.student?.name?.toLowerCase().includes(query)) ||
        Boolean(enrollment.student?.email?.toLowerCase().includes(query)),
    )
  }, [data?.items, search])


  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'سجل الطلاب المسجلين' : 'Student Roster'}
        title={courseData?.course ? `${isAr ? 'طلاب: ' : 'Students: '}${courseData.course.title}` : (isAr ? 'طلاب الدورة التدريبية' : 'Course Students')}
        description={
          isAr
            ? 'متابعة تقدم الطلاب الدراسي، معدلات إتمام الدروس، وتاريخ انضمامهم للدورة.'
            : 'Inspect student cohort telemetry, individual syllabus progression, and enrollment timelines.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('dash.myTaughtCourses'), to: '/teach/courses' },
          { label: courseData?.course?.title ?? slug, to: `/teach/courses/${slug}` },
          { label: isAr ? 'الطلاب المسجلون' : 'Students' },
        ]}
        actions={
          <Link to={`/teach/courses/${slug}`} className="no-underline">
            <Button variant="outline" size="sm">
              {isAr ? 'تفاصيل الدورة' : 'Course Details'}
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Search bar & count indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-surface/90 border border-border text-xs font-bold text-text-main shadow-xs">
            <IconUsers size={16} className="text-primary" />
            <span>
              {isAr ? 'إجمالي المسجلين:' : 'Total Enrolled:'}{' '}
              <span className="font-mono text-primary">{formatNumber(data?.meta.total ?? 0)}</span>
            </span>
          </div>

          <div className="relative max-w-xs w-full">
            <IconSearch
              size={16}
              className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'البحث بالاسم أو البريد...' : 'Search student by name/email...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <CenteredSpinner label={t('common.loading')} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={36} stroke={1.5} />}
            title={
              search
                ? isAr
                  ? 'لا يوجد طلاب مطابقون لبحثك'
                  : 'No matching students found'
                : isAr
                  ? 'لم يسجل أي طالب في هذه الدورة بعد'
                  : 'No students enrolled yet'
            }
            description={
              isAr
                ? 'عندما يسجل الطلاب في هذا الكورس، ستظهر بياناتهم ومعدل تقدمهم الدراسي هنا مباشرة.'
                : 'When students enroll, their syllabus progress and quiz scores will appear here.'
            }
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'بيانات الطالب' : 'Student'}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'التقدم الدراسي' : 'Progress'}</th>
                    <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'تاريخ التسجيل' : 'Enrolled At'}</th>
                    <th className="py-3.5 px-5 text-end">{isAr ? 'آخر تفاعل' : 'Last Activity'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={enrollment.student?.name ?? (isAr ? 'طالب' : 'Learner')}
                            src={enrollment.student?.avatar_url}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-text-main truncate block text-xs sm:text-sm">
                              {enrollment.student?.name ?? (isAr ? 'طالب' : 'Learner')}
                            </span>
                            <span className="text-[11px] text-text-subtle font-mono truncate block">
                              {enrollment.student?.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex flex-col gap-1 max-w-[140px]">
                          <div className="flex items-center justify-between text-[11px] font-bold text-text-muted">
                            <span>{isAr ? 'الإنجاز' : 'Done'}</span>
                            <span className="font-mono text-text-main">
                              {formatPercent(enrollment.progress_percent, 0)}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-muted overflow-hidden border border-border/40">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, enrollment.progress_percent))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge tone={STATUS_TONE[enrollment.status]}>
                          {enrollment.status === 'completed'
                            ? (isAr ? 'مكتمل' : 'Completed')
                            : enrollment.status === 'active'
                              ? (isAr ? 'قيد الدراسة' : 'Active')
                              : (isAr ? 'ملغي' : 'Cancelled')}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-5 text-xs text-text-muted">
                        {formatDate(enrollment.enrolled_at)}
                      </td>

                      <td className="py-3.5 px-5 text-xs text-text-muted text-end font-mono">
                        {enrollment.last_accessed_at
                          ? formatDate(enrollment.last_accessed_at)
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data ? (
              <div className="p-4 border-t border-border bg-surface-muted/30">
                <Pagination meta={data.meta} onChange={setPage} />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

