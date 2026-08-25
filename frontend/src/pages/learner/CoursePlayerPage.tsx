import {
  IconArrowLeft,
  IconArrowRight,
  IconCertificate,
  IconCircleCheck,
  IconPaperclip,
} from '@tabler/icons-react'
import { useCallback } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Markdown } from '@/components/atoms/Markdown'
import { ProgressBar } from '@/components/atoms/ProgressBar'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { CurriculumAccordion } from '@/components/organisms/CurriculumAccordion'
import { LessonAssignmentPanel } from '@/components/organisms/LessonAssignmentPanel'
import { LessonQuizPanel } from '@/components/organisms/LessonQuizPanel'
import { VideoPlayer } from '@/components/organisms/VideoPlayer'
import type { Assignment, Quiz } from '@/core/domain/schemas/assessment'
import { getLocalizedCoursePlayer } from '@/features/catalog/localizedCatalog'
import { useClaimCertificate, useCompleteLesson, useCoursePlayer, useTrackProgress } from '@/features/learning/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function CoursePlayerPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, isAr, language, formatDuration, formatPercent, formatNumber } = useTranslation()

  const lessonSlug = searchParams.get('lesson') ?? undefined

  const { data: rawData, isLoading, isError } = useCoursePlayer(slug, lessonSlug)
  const trackProgress = useTrackProgress()
  const completeLesson = useCompleteLesson(slug ?? '')
  const claimCertificate = useClaimCertificate()

  const goToLesson = useCallback(
    (nextSlug: string) => {
      setSearchParams({ lesson: nextSlug })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setSearchParams],
  )

  const onProgress = useCallback(
    (watched: number, position: number) => {
      const lessonId = rawData?.current_lesson?.id

      if (lessonId) {
        trackProgress.mutate({ lessonId, watchedSeconds: watched, positionSeconds: position })
      }
    },
    [rawData?.current_lesson?.id, trackProgress],
  )

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />

  if (isError || !rawData) return <Navigate to={`/courses/${slug}`} replace />

  const data = getLocalizedCoursePlayer(rawData, language)
  const { course, enrollment, current_lesson: lesson, next_lesson: next, previous_lesson: previous } = data
  const isCompleted = lesson ? data.completed_lesson_ids.includes(lesson.id) : false
  const quiz = lesson?.quiz as Quiz | null | undefined
  const assignment = lesson?.assignment as Assignment | null | undefined

  return (
    <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-6 sm:py-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Lesson View Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <Link to={`/courses/${course.slug}`} className="text-xs font-bold text-primary hover:underline no-underline">
                {isAr ? `← العودة لصفحة الدورة (${course.title})` : `← Back to course details (${course.title})`}
              </Link>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-text-main tracking-tight mt-1 m-0">
                {lesson?.title ?? (isAr ? 'درس الدورة' : 'Lesson')}
              </h1>
            </div>

            {lesson ? (
              <Badge tone={isCompleted ? 'success' : 'primary'} className="self-start sm:self-center">
                {isCompleted ? (isAr ? '✓ درس مكتمل' : '✓ Completed') : formatDuration(lesson.duration_minutes)}
              </Badge>
            ) : null}
          </div>

          {lesson?.type === 'video' || lesson?.type === 'resource' ? (
            <VideoPlayer
              url={lesson.video_url}
              title={lesson.title}
              startAtSeconds={lesson.last_position_seconds ?? 0}
              onProgress={onProgress}
              onEnded={() => completeLesson.mutate({ lessonId: lesson.id })}
            />
          ) : null}

          {lesson?.type === 'article' && lesson.content ? (
            <article className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs">
              <Markdown content={lesson.content} />
            </article>
          ) : null}

          {lesson?.type === 'quiz' && quiz ? (
            <LessonQuizPanel quizId={quiz.id} courseSlug={course.slug} />
          ) : null}

          {lesson?.type === 'assignment' && assignment ? (
            <LessonAssignmentPanel assignmentId={assignment.id} />
          ) : null}


          {lesson?.attachments && lesson.attachments.length > 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted m-0">
                {isAr ? 'المرفقات والملفات المرفقة' : 'Lesson Attachments & Resources'}
              </h3>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {lesson.attachments.map((attachment: { name: string; url: string }) => (
                  <li key={attachment.url}>
                    <a
                      href={attachment.url}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <IconPaperclip size={15} /> {attachment.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={isAr ? <IconArrowRight size={15} /> : <IconArrowLeft size={15} />}
              disabled={!previous}
              onClick={() => previous && goToLesson(previous.slug)}
            >
              {isAr ? 'الدرس السابق' : 'Previous Lesson'}
            </Button>

            {lesson && lesson.type !== 'quiz' ? (
              <Button
                variant={isCompleted ? 'outline' : 'success'}
                size="sm"
                icon={<IconCircleCheck size={15} />}
                loading={completeLesson.isPending}
                onClick={() => completeLesson.mutate({ lessonId: lesson.id, undo: isCompleted })}
              >
                {isCompleted ? (isAr ? 'إلغاء وضع الاكتمال' : 'Mark Incomplete') : (isAr ? 'تحديد كالدرس مكتمل ✓' : 'Mark as Completed ✓')}
              </Button>
            ) : null}

            <Button
              size="sm"
              iconRight={isAr ? <IconArrowLeft size={15} /> : <IconArrowRight size={15} />}
              disabled={!next}
              onClick={() => next && goToLesson(next.slug)}
            >
              {isAr ? 'الدرس التالي' : 'Next Lesson'}
            </Button>
          </div>
        </div>

        {/* Sidebar Curriculum Rail */}
        <aside className="lg:col-span-4 sticky top-24">
          <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-lg flex flex-col gap-5 p-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-text-main mb-2">
                <span>{t('courses.progress')}</span>
                <span className="tabular-nums text-primary font-bold">{formatPercent(Math.round(enrollment.progress_percent))}</span>
              </div>

              <ProgressBar value={enrollment.progress_percent} size="sm" />

              <p className="text-xs text-text-muted mt-2 mb-0 font-medium">
                {isAr
                  ? `تم إنهاء ${formatNumber(enrollment.completed_lessons_count)} من أصل ${formatNumber(course.lessons_count)} درس`
                  : `Completed ${enrollment.completed_lessons_count} of ${course.lessons_count} lessons`}
              </p>

              {enrollment.status === 'completed' ? (
                <Button
                  size="sm"
                  fullWidth
                  className="mt-3.5"
                  iconRight={<IconCertificate size={16} />}
                  loading={claimCertificate.isPending}
                  onClick={() =>
                    claimCertificate.mutate(course.slug, {
                      onSuccess: () => navigate('/certificates'),
                    })
                  }
                >
                  {isAr ? 'استلام شهادة التخرج المعتمدة' : 'Claim Verified Certificate'}
                </Button>
              ) : null}
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-3">
                {t('courses.courseContent')}
              </h3>
              <div className="max-h-[calc(100vh-22rem)] overflow-y-auto ps-1">
                <CurriculumAccordion
                  sections={course.sections}
                  completedLessonIds={data.completed_lesson_ids}
                  activeLessonId={lesson?.id}
                  onSelectLesson={(selected) => goToLesson(selected.slug)}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
