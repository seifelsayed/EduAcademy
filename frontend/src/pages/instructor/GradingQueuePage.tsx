import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCheck,
  IconClipboardCheck,
  IconClock,
  IconEdit,
  IconRefresh,
} from '@tabler/icons-react'
import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input, Textarea } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { Modal } from '@/components/molecules/Modal'
import { Pagination } from '@/components/molecules/Pagination'
import { PageHeader } from '@/components/templates/PageHeader'
import type { Assignment, Submission } from '@/core/domain/schemas/assessment'
import { gradeFormSchema, type GradeForm, type GradeFormInput } from '@/core/domain/schemas/forms'
import { useGradeSubmission, usePendingSubmissions } from '@/features/assessment/hooks'
import { formatRelative } from '@/shared/lib/format'
import { useTranslation } from '@/shared/lib/i18n'

export function GradingQueuePage() {
  const [page, setPage] = useState(1)
  const [active, setActive] = useState<Submission | null>(null)

  const { data, isLoading } = usePendingSubmissions(page)
  const { t, isAr, formatNumber } = useTranslation()

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'التقييمات والواجبات' : 'Assessment Center'}
        title={t('dash.gradingTitle')}
        description={
          isAr
            ? 'مراجعة وتقييم حلول الواجبات العملية والمشاريع البرمجية المسلمة من طلابك ورصد الدرجات.'
            : 'Review, evaluate, and provide constructive feedback on pending student assignment submissions.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('navigation.teach'), to: '/teach' },
          { label: t('dash.gradingTitle') },
        ]}
      />

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <CenteredSpinner label={t('dash.gradingLoading')} />
        ) : (data?.items.length ?? 0) === 0 ? (
          <EmptyState
            icon={<IconClipboardCheck size={36} stroke={1.5} />}
            title={t('dash.gradingEmpty')}
            description={t('dash.gradingEmptyDesc')}
            action={
              <Link to="/teach/courses" className="no-underline">
                <Button size="sm">{t('dash.myTaughtCourses')}</Button>
              </Link>
            }
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 sm:px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-black text-text-main m-0 uppercase tracking-wider">
                  {isAr ? 'قائمة التسليمات المعلقة' : 'Pending Submissions Queue'}
                </h2>
              </div>
              <span className="text-xs font-bold text-text-muted">
                {formatNumber(data?.meta.total ?? 0)} {isAr ? 'واجب بانتظار التقييم' : 'pending'}
              </span>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {data?.items.map((submission) => {
                const assignment = submission.assignment as Assignment | undefined

                return (
                  <div
                    key={submission.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors flex-wrap sm:flex-nowrap"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar
                        name={submission.student?.name ?? t('dash.learner')}
                        src={submission.student?.avatar_url}
                        size="md"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm text-text-main leading-tight truncate">
                            {submission.student?.name}
                          </span>
                          {submission.is_late ? (
                            <Badge tone="warning">{t('dash.late')}</Badge>
                          ) : null}
                        </div>

                        <span className="text-xs text-text-muted truncate block">
                          {isAr ? 'الواجب: ' : 'Assignment: '}
                          <strong className="text-text-main font-semibold">
                            {assignment?.title ?? t('dash.assignment')}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ms-auto">
                      <span className="text-xs text-text-subtle font-mono flex items-center gap-1">
                        <IconClock size={13} />
                        <span>{formatRelative(submission.submitted_at)}</span>
                      </span>

                      <Button
                        size="sm"
                        icon={<IconEdit size={14} />}
                        onClick={() => setActive(submission)}
                      >
                        {isAr ? 'تقييم الحل' : 'Grade Submission'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {data ? (
              <div className="p-4 border-t border-border bg-surface-muted/30">
                <Pagination meta={data.meta} onChange={setPage} />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {active ? (
        <GradeModal
          submission={active}
          isAr={isAr}
          onClose={() => setActive(null)}
        />
      ) : null}
    </div>
  )
}

function GradeModal({
  submission,
  isAr,
  onClose,
}: {
  submission: Submission
  isAr: boolean
  onClose: () => void
}) {
  const assignment = submission.assignment as Assignment | undefined
  const maxPoints = assignment?.max_points ?? 100

  const { grade, returnForRevision } = useGradeSubmission()
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<GradeFormInput, unknown, GradeForm>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: { score: maxPoints, feedback: '' },
  })

  return (
    <Modal
      open
      size="lg"
      title={`${t('dash.evaluate')} — ${submission.student?.name ?? t('dash.learner')}`}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            icon={<IconRefresh size={14} />}
            loading={returnForRevision.isPending}
            onClick={() => {
              const feedback = getValues('feedback')
              if (!feedback?.trim()) return

              returnForRevision.mutate(
                { id: submission.id, feedback },
                { onSuccess: onClose },
              )
            }}
          >
            {isAr ? 'طلب إعادة المحاولة' : 'Request Revision'}
          </Button>

          <Button
            size="sm"
            icon={<IconCheck size={14} />}
            loading={grade.isPending}
            onClick={handleSubmit((values) =>
              grade.mutate({ id: submission.id, input: values }, { onSuccess: onClose }),
            )}
          >
            {isAr ? 'اعتماد الدرجة النهائية' : 'Submit Final Grade'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-text-muted mb-2">
            {t('dash.studentSubmission')} ({assignment?.title ?? t('dash.assignment')})
          </h4>
          <div className="border border-border rounded-2xl p-4 text-xs sm:text-sm text-text-main whitespace-pre-line leading-relaxed bg-surface-muted/40 font-mono max-h-48 overflow-y-auto">
            {submission.content ?? <span className="text-text-muted italic">{isAr ? 'لم يكتب الطالب نصاً مع التسليم.' : 'No written submission text provided.'}</span>}
          </div>
        </div>

        <FormField
          label={`${isAr ? 'الدرجة المستحقة (من' : 'Score Awarded (out of'} ${maxPoints} ${isAr ? 'درجة كحد أقصى)' : 'max points)'}`}
          error={errors.score?.message}
          required
        >
          <Input type="number" min={0} max={maxPoints} {...register('score')} />
        </FormField>

        <FormField
          label={isAr ? 'الملاحظات والتوجيهات التقييمية' : 'Instructor Feedback'}
          error={errors.feedback?.message}
          hint={isAr ? 'إلزامية في حال طلبت إعادة المحاولة.' : 'Required if you request revision.'}
        >
          <Textarea rows={4} placeholder={isAr ? 'اكتب ملاحظاتك ونقاط القوة ومجالات التطوير...' : 'Highlight strengths and areas for revision...'} {...register('feedback')} />
        </FormField>
      </div>
    </Modal>
  )
}

