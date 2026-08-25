import { IconBook, IconCompass, IconPlayerPlay, IconSearch } from '@tabler/icons-react'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Pagination } from '@/components/molecules/Pagination'
import { CourseCard } from '@/components/organisms/CourseCard'
import { PageHeader } from '@/components/templates/PageHeader'
import type { EnrollmentStatus } from '@/core/domain/schemas/learning'
import { useMyEnrollments } from '@/features/learning/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function MyLearningPage() {
  const [status, setStatus] = useState<EnrollmentStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { t, isAr } = useTranslation()

  const { data, isLoading } = useMyEnrollments(status, page)

  const filteredItems = useMemo(() => {
    if (!data?.items) return []
    if (!search.trim()) return data.items

    const query = search.toLowerCase()
    return data.items.filter((item) => item.course?.title.toLowerCase().includes(query))
  }, [data?.items, search])

  const tabs: { label: string; value: EnrollmentStatus | undefined }[] = [
    { label: t('common.all'), value: undefined },
    { label: isAr ? 'قيد التعلّم' : 'In Progress', value: 'active' },
    { label: isAr ? 'المكتملة' : 'Completed', value: 'completed' },
  ]

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'بوابة التعلّم' : 'Learning Portal'}
        title={t('navigation.myLearning')}
        description={
          isAr
            ? 'تتبع جميع الدورات المسجل بها، نسب الإنجاز، والشهادات المكتسبة.'
            : 'Track your enrolled courses, syllabus progression, and earned credentials.'
        }
        breadcrumbs={[{ label: t('navigation.home'), to: '/' }, { label: t('navigation.myLearning') }]}
        actions={
          <Link to="/courses" className="no-underline">
            <Button variant="outline" size="sm" icon={<IconCompass size={15} />}>
              {t('dash.browseCourses')}
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Navigation Tabs and Search Bar */}
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
              placeholder={isAr ? 'البحث في دوراتي...' : 'Search my courses...'}
              className="w-full ps-9 pe-4 py-2 rounded-xl bg-surface border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <CenteredSpinner label={t('common.loading')} />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={<IconBook size={36} stroke={1.5} />}
            title={
              search
                ? isAr
                  ? 'لا توجد نتائج مطابقة لبحثك'
                  : 'No matching courses found'
                : isAr
                  ? 'لا توجد كورسات في هذا القسم حالياً'
                  : 'No courses in this section'
            }
            description={
              isAr
                ? 'سجّل في دورات جديدة لتبدأ رحلتك أو جرّب البحث بكلمات مختلفة.'
                : 'Browse our catalog to enroll in high-demand courses.'
            }
            action={
              <Link to="/courses" className="no-underline">
                <Button size="sm" icon={<IconCompass size={15} />}>
                  {t('home.browseAllCourses')}
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map((enrollment) =>
                enrollment.course ? (
                  <div key={enrollment.id} className="h-full">
                    <CourseCard
                      course={enrollment.course}
                      progressPercent={enrollment.progress_percent}
                      href={`/learn/${enrollment.course.slug}`}
                      footer={
                        <div className="flex items-center gap-2 w-full">
                          <Link
                            to={`/learn/${enrollment.course.slug}`}
                            className="no-underline flex-1"
                          >
                            <Button fullWidth size="sm" iconRight={<IconPlayerPlay size={14} />}>
                              {enrollment.status === 'completed'
                                ? (isAr ? 'مراجعة الدورة' : 'Review Course')
                                : enrollment.progress_percent > 0
                                  ? t('courses.continueLearning')
                                  : t('courses.startCourse')}
                            </Button>
                          </Link>

                          {enrollment.status === 'completed' ? (
                            <Link to="/certificates" className="no-underline">
                              <Button variant="outline" size="sm">
                                {isAr ? 'الشهادة' : 'Certificate'}
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      }
                    />
                  </div>
                ) : null,
              )}
            </div>

            {data ? (
              <div className="pt-2">
                <Pagination meta={data.meta} onChange={setPage} />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

