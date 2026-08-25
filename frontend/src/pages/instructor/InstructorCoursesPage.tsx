import {
  IconEdit,
  IconEye,
  IconListCheck,
  IconPlus,
  IconSchool,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { PageHeader } from '@/components/templates/PageHeader'
import type { CourseStatus } from '@/core/domain/schemas/catalog'
import { useMyCourses } from '@/features/catalog/hooks'
import { getLocalizedCourse } from '@/features/catalog/localizedCatalog'
import { getCourseThumbnail } from '@/shared/lib/courseAssets'
import { useTranslation } from '@/shared/lib/i18n'

const STATUS_TONE: Record<CourseStatus, 'success' | 'warning' | 'info' | 'muted'> = {
  published: 'success',
  draft: 'warning',
  pending_review: 'info',
  archived: 'muted',
}

export function InstructorCoursesPage() {
  const [status, setStatus] = useState<CourseStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { t, tPlural, isAr, language, formatMoney, formatNumber } = useTranslation()

  const { data, isLoading } = useMyCourses({ status, page, per_page: 12 })

  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    if (!search.trim()) return data.items

    const query = search.toLowerCase()
    return data.items.filter((c) => {
      const course = getLocalizedCourse(c, language)
      return course.title.toLowerCase().includes(query) || course.slug.toLowerCase().includes(query)
    })
  }, [data?.items, search, language])

  const tabs: { label: string; value: CourseStatus | undefined }[] = [
    { label: t('common.all'), value: undefined },
    { label: isAr ? 'المنشورة' : 'Published', value: 'published' },
    { label: isAr ? 'المسودات' : 'Drafts', value: 'draft' },
    { label: isAr ? 'المؤرشفة' : 'Archived', value: 'archived' },
  ]

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'لوحة تحكم المدرّب' : 'Instructor Studio'}
        title={isAr ? 'إدارة دوراتك التدريبية' : 'Your Courses'}
        description={
          isAr
            ? 'تصميم وبناء المناهج، مراقبة تقدم طلابك، وإدارة نشر الدورات.'
            : 'Design, author curricula, monitor student cohorts, and manage course publishing lifecycle.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.teach'), to: '/teach' },
          { label: t('navigation.courses') },
        ]}
        actions={
          <Link to="/teach/courses/new" className="no-underline">
            <Button size="sm" icon={<IconPlus size={15} />}>
              {isAr ? 'إنشاء كورس جديد' : 'Create New Course'}
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Navigation Tabs and Search Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface/90 backdrop-blur-md border border-border w-fit shadow-xs">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={clsx(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none',
                  status === tab.value
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-text-muted hover:text-text-main hover:bg-surface-hover',
                )}
                onClick={() => {
                  setStatus(tab.value)
                  setPage(1)
                }}
              >
                {tab.label}
              </button>
            ))}
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
              placeholder={isAr ? 'البحث في الكورسات...' : 'Search courses by title...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <CenteredSpinner label={t('common.loading')} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<IconSchool size={36} stroke={1.5} />}
            title={
              search
                ? isAr
                  ? 'لا توجد كورسات مطابقة لبحثك'
                  : 'No matching courses found'
                : isAr
                  ? 'لا توجد كورسات في هذا القسم'
                  : 'No courses found in this category'
            }
            description={
              isAr
                ? 'ابدأ في بناء منهجك التعليمي بالدروس المرئية والتطبيقات والاختبارات التفاعلية.'
                : 'Start building your curriculum with interactive lessons, quizzes, and projects.'
            }
            action={
              <Link to="/teach/courses/new" className="no-underline">
                <Button size="sm" icon={<IconPlus size={15} />}>
                  {isAr ? 'أنشئ أول كورس لك الآن' : 'Create your first course'}
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3.5 px-5 text-start">{isAr ? 'الدورة التدريبية' : 'Course'}</th>
                    <th className="py-3.5 px-5 text-start">{t('common.status')}</th>
                    <th className="py-3.5 px-5 text-start">{t('home.statStudents')}</th>
                    <th className="py-3.5 px-5 text-start">{t('courses.rating')}</th>
                    <th className="py-3.5 px-5 text-start">{isAr ? 'السعر' : 'Price'}</th>
                    <th className="py-3.5 px-5 text-end">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((rawCourse) => {
                    const course = getLocalizedCourse(rawCourse, language)
                    const thumbnail = getCourseThumbnail(course)
                    return (
                      <tr key={course.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={thumbnail}
                              alt=""
                              className="rounded-xl w-18 aspect-video object-cover shrink-0 border border-border shadow-2xs"
                            />

                            <div className="min-w-0">
                              <Link
                                to={`/teach/courses/${course.slug}`}
                                className="font-bold text-text-main hover:text-primary transition-colors no-underline line-clamp-1 max-w-sm block"
                              >
                                {course.title}
                              </Link>
                              <span className="text-[11px] text-text-muted">
                                {tPlural(course.lessons_count, 'lessons')} · {formatNumber(course.sections_count)} {isAr ? 'وحدات' : 'sections'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <Badge tone={STATUS_TONE[course.status]}>{t(`common.${course.status}`)}</Badge>
                        </td>

                        <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                          {formatNumber(course.students_count)}
                        </td>

                        <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                          {course.rating.count > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span>★</span>
                              <span>{isAr ? formatNumber(parseFloat(course.rating.average.toFixed(1))) : course.rating.average.toFixed(1)}</span>
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="py-3.5 px-5 font-bold tabular-nums text-text-main">
                          {course.price.is_free
                            ? t('common.free')
                            : formatMoney(course.price.effective_cents, course.price.currency)}
                        </td>

                        <td className="py-3.5 px-5 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/teach/courses/${course.slug}/curriculum`}
                              className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary-light transition-colors no-underline"
                              title={isAr ? 'تعديل المنهج الدراسي' : 'Edit curriculum'}
                            >
                              <IconListCheck size={16} />
                            </Link>

                            <Link
                              to={`/teach/courses/${course.slug}/students`}
                              className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary-light transition-colors no-underline"
                              title={isAr ? 'عرض الطلاب المسجلين' : 'View enrolled students'}
                            >
                              <IconUsers size={16} />
                            </Link>

                            <Link
                              to={`/teach/courses/${course.slug}`}
                              className="p-2 rounded-xl text-text-muted hover:text-primary hover:bg-primary-light transition-colors no-underline"
                              title={isAr ? 'تعديل بيانات الكورس' : 'Edit course details'}
                            >
                              <IconEdit size={16} />
                            </Link>

                            <Link
                              to={`/courses/${course.slug}`}
                              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors no-underline"
                              title={isAr ? 'معاينة الصفحة العامة' : 'Preview public page'}
                            >
                              <IconEye size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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

