import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconChevronDown,
  IconChevronUp,
  IconClipboardText,
  IconEdit,
  IconListCheck,
  IconPlus,
  IconQuestionMark,
  IconSettings,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'



import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Link, useParams } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Checkbox, Input, Select, Textarea } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { ConfirmDialog, Modal } from '@/components/molecules/Modal'
import { PageHeader } from '@/components/templates/PageHeader'
import { AssignmentEditor } from '@/pages/instructor/AssignmentEditor'
import { QuizEditor } from '@/pages/instructor/QuizEditor'
import type { Lesson, Section } from '@/core/domain/schemas/catalog'
import {
  lessonFormSchema,
  sectionFormSchema,
  type LessonForm,
  type LessonFormInput,
  type SectionForm,
  type SectionFormInput,
} from '@/core/domain/schemas/forms'
import { useCurriculumMutations, useSections } from '@/features/catalog/hooks'
import { formatDuration } from '@/shared/lib/format'
import { useTranslation } from '@/shared/lib/i18n'

export function CurriculumEditorPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t, isAr, formatNumber } = useTranslation()

  const { data: sections, isLoading } = useSections(slug)
  const mutations = useCurriculumMutations(slug)

  const [sectionModal, setSectionModal] = useState<{ open: boolean; section?: Section }>({
    open: false,
  })
  const [lessonModal, setLessonModal] = useState<{
    open: boolean
    sectionId?: number
    lesson?: Lesson
  }>({ open: false })
  const [quizLesson, setQuizLesson] = useState<Lesson | null>(null)
  const [assignmentLesson, setAssignmentLesson] = useState<Lesson | null>(null)
  const [pendingDelete, setPendingDelete] = useState<
    { kind: 'section' | 'lesson'; id: number; title: string } | null
  >(null)

  if (isLoading) return <CenteredSpinner label={t('common.loading')} />

  const ordered = sections ?? []

  const moveSection = (index: number, direction: -1 | 1) => {
    const next = [...ordered]
    const target = next[index + direction]
    const current = next[index]

    if (!target || !current) return

    next[index + direction] = current
    next[index] = target

    mutations.reorderSections.mutate(next.map((section) => section.id))
  }

  const moveLesson = (section: Section, index: number, direction: -1 | 1) => {
    const lessons = [...(section.lessons ?? [])]
    const target = lessons[index + direction]
    const current = lessons[index]

    if (!target || !current) return

    lessons[index + direction] = current
    lessons[index] = target

    mutations.reorderLessons.mutate({
      sectionId: section.id,
      ids: lessons.map((lesson) => lesson.id),
    })
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={isAr ? 'هندسة وبناء المنهج' : 'Curriculum Architect'}
        title={isAr ? 'منهج الدورة التعليمية' : 'Course Curriculum'}
        description={
          isAr
            ? 'تنظيم فصول الدورة التعليمية وإضافة الدروس المرئية، القراءات، الاختبارات والواجبات العملية.'
            : 'Organize your course syllabus into thematic sections, video lectures, reading modules, and assessments.'
        }
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('dash.myTaughtCourses'), to: '/teach/courses' },
          { label: isAr ? 'المنهج الدراسي' : 'Curriculum' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/teach/courses/${slug}`} className="no-underline">
              <Button variant="outline" size="sm" icon={<IconSettings size={15} />}>
                {isAr ? 'تفاصيل الكورس' : 'Course Details'}
              </Button>
            </Link>
            <Button size="sm" icon={<IconPlus size={15} />} onClick={() => setSectionModal({ open: true })}>
              {isAr ? 'إضافة فصل جديد' : 'Add Section'}
            </Button>
          </div>
        }
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border w-fit shadow-xs overflow-x-auto max-w-full">
        <Link
          to={`/teach/courses/${slug}`}
          className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface-hover no-underline shrink-0 flex items-center gap-1.5"
        >
          <IconSettings size={14} />
          <span>{isAr ? 'تفاصيل الكورس' : 'Course Details'}</span>
        </Link>
        <Link
          to={`/teach/courses/${slug}/curriculum`}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-xs no-underline shrink-0 flex items-center gap-1.5"
        >
          <IconListCheck size={14} />
          <span>{isAr ? 'المنهج والاختبارات' : 'Curriculum & Quizzes'}</span>
        </Link>
        <Link
          to={`/teach/courses/${slug}/students`}
          className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface-hover no-underline shrink-0 flex items-center gap-1.5"
        >
          <IconUsers size={14} />
          <span>{isAr ? 'الطلاب المسجلون' : 'Enrolled Students'}</span>
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {ordered.length === 0 ? (
          <EmptyState
            title={isAr ? 'لم يتم إنشاء أي فصول في المنهج بعد' : 'No curriculum sections created yet'}
            description={
              isAr
                ? 'الفصول تنظم الدروس في وحدات تعليمية مترابطة (مثال: "الوحدة الأولى: المفاهيم الأساسية").'
                : "Sections group lessons together into structured modules (e.g. 'Module 1: Introduction & Setup')."
            }
            action={
              <Button size="sm" icon={<IconPlus size={15} />} onClick={() => setSectionModal({ open: true })}>
                {isAr ? 'أنشئ أول فصل الآن' : 'Add your first section'}
              </Button>
            }
          />
        ) : null}

        {ordered.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col transition-all"
          >
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border bg-surface-muted/40 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm sm:text-base font-black text-text-main m-0 truncate">
                  {isAr ? `الفصل ${formatNumber(sectionIndex + 1)}: ` : `Section ${sectionIndex + 1}: `}
                  {section.title}
                </h2>
                <p className="text-xs text-text-muted mt-0.5 mb-0">
                  {formatNumber((section.lessons ?? []).length)} {isAr ? 'دروس' : 'lessons'} ·{' '}
                  {formatDuration(section.duration_minutes ?? 0)} {isAr ? 'إجمالي المدة' : 'duration'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Move section up"
                  disabled={sectionIndex === 0}
                  icon={<IconChevronUp size={15} />}
                  onClick={() => moveSection(sectionIndex, -1)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Move section down"
                  disabled={sectionIndex === ordered.length - 1}
                  icon={<IconChevronDown size={15} />}
                  onClick={() => moveSection(sectionIndex, 1)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconEdit size={15} />}
                  onClick={() => setSectionModal({ open: true, section })}
                >
                  {isAr ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconTrash size={15} />}
                  className="text-text-muted hover:text-danger hover:bg-danger-light"
                  aria-label="Delete section"
                  onClick={() =>
                    setPendingDelete({ kind: 'section', id: section.id, title: section.title })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col divide-y divide-border/60">
              {(section.lessons ?? []).map((lesson, lessonIndex) => (
                <div
                  key={lesson.id}
                  className="px-5 sm:px-6 py-3.5 flex items-center gap-3.5 hover:bg-surface-hover/50 transition-colors flex-wrap sm:flex-nowrap"
                >
                  <span className="text-xs font-mono font-bold text-text-subtle w-8 tabular-nums">
                    {sectionIndex + 1}.{lessonIndex + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs sm:text-sm text-text-main truncate">
                      {lesson.title}
                    </span>
                    <span className="text-[11px] text-text-muted capitalize">
                      {lesson.type === 'quiz' ? (isAr ? 'اختبار تفاعلي' : 'Interactive Quiz') : lesson.type} · {formatDuration(lesson.duration_minutes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {lesson.is_preview ? <Badge tone="success">{isAr ? 'معاينة مجانية' : 'Preview'}</Badge> : null}
                    {!lesson.is_published ? <Badge tone="warning">{isAr ? 'مخفي' : 'Hidden'}</Badge> : null}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    {lesson.type === 'quiz' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        className="shadow-xs font-bold text-xs"
                        icon={<IconQuestionMark size={14} />}
                        onClick={() => setQuizLesson(lesson)}
                      >
                        {isAr ? 'إعداد أسئلة الاختبار' : 'Manage Quiz Questions'}
                      </Button>
                    ) : null}


                    {lesson.type === 'assignment' ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs font-bold"
                        icon={<IconClipboardText size={14} />}
                        onClick={() => setAssignmentLesson(lesson)}
                      >
                        {isAr ? 'إعداد الواجب' : 'Brief'}
                      </Button>
                    ) : null}


                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Move lesson up"
                      disabled={lessonIndex === 0}
                      icon={<IconChevronUp size={15} />}
                      onClick={() => moveLesson(section, lessonIndex, -1)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Move lesson down"
                      disabled={lessonIndex === (section.lessons ?? []).length - 1}
                      icon={<IconChevronDown size={15} />}
                      onClick={() => moveLesson(section, lessonIndex, 1)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Edit lesson"
                      icon={<IconEdit size={15} />}
                      onClick={() => setLessonModal({ open: true, sectionId: section.id, lesson })}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Delete lesson"
                      icon={<IconTrash size={15} />}
                      className="text-text-muted hover:text-danger hover:bg-danger-light"
                      onClick={() =>
                        setPendingDelete({ kind: 'lesson', id: lesson.id, title: lesson.title })
                      }
                    />
                  </div>
                </div>
              ))}

              {(section.lessons ?? []).length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  {isAr ? 'لا توجد دروس في هذا الفصل بعد.' : 'No lessons in this section yet.'}
                </div>
              ) : null}
            </div>

            <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-surface-muted/30">
              <Button
                variant="outline"
                size="sm"
                icon={<IconPlus size={15} />}
                onClick={() => setLessonModal({ open: true, sectionId: section.id })}
              >
                {isAr ? 'إضافة درس لهذا الفصل' : 'Add Lesson'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <SectionModal
        open={sectionModal.open}
        section={sectionModal.section}
        saving={mutations.createSection.isPending || mutations.updateSection.isPending}
        isAr={isAr}
        onClose={() => setSectionModal({ open: false })}
        onSubmit={(values) => {
          if (sectionModal.section) {
            mutations.updateSection.mutate({ id: sectionModal.section.id, input: values })
          } else {
            mutations.createSection.mutate(values)
          }

          setSectionModal({ open: false })
        }}
      />

      <LessonModal
        open={lessonModal.open}
        lesson={lessonModal.lesson}
        saving={mutations.createLesson.isPending || mutations.updateLesson.isPending}
        isAr={isAr}
        onClose={() => setLessonModal({ open: false })}
        onSubmit={(values) => {
          if (lessonModal.lesson) {
            mutations.updateLesson.mutate({ id: lessonModal.lesson.id, input: values })
          } else if (lessonModal.sectionId) {
            mutations.createLesson.mutate({ sectionId: lessonModal.sectionId, input: values })
          }

          setLessonModal({ open: false })
        }}
      />

      {quizLesson ? (
        <Modal
          open
          title={`${isAr ? 'إدارة بنك أسئلة الاختبار' : 'Quiz Manager'} — ${quizLesson.title}`}
          size="lg"
          onClose={() => setQuizLesson(null)}
        >
          <QuizEditor lesson={quizLesson} />
        </Modal>
      ) : null}

      {assignmentLesson ? (
        <Modal
          open
          title={`${isAr ? 'مواصفات الواجب العملي' : 'Assignment Brief'} — ${assignmentLesson.title}`}
          size="lg"
          onClose={() => setAssignmentLesson(null)}
        >
          <AssignmentEditor lesson={assignmentLesson} />
        </Modal>
      ) : null}

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete?.kind === 'section'
            ? isAr
              ? 'هل أنت متأكد من حذف هذا الفصل؟'
              : 'Delete section?'
            : isAr
              ? 'هل أنت متأكد من حذف هذا الدرس؟'
              : 'Delete lesson?'
        }
        message={
          pendingDelete?.kind === 'section'
            ? isAr
              ? `سيتم حذف الفصل “${pendingDelete.title}” مع جميع الدروس التابعة له نهائياً.`
              : `“${pendingDelete.title}” and all nested lessons will be permanently removed.`
            : isAr
              ? `سيتم حذف الدرس “${pendingDelete?.title}” مع سجلات تسليمات الطلاب.`
              : `“${pendingDelete?.title}” will be removed along with learner submission records.`
        }
        confirmLabel={isAr ? 'تأكيد الحذف' : 'Delete'}
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete?.kind === 'section') {
            mutations.deleteSection.mutate(pendingDelete.id)
          } else if (pendingDelete) {
            mutations.deleteLesson.mutate(pendingDelete.id)
          }

          setPendingDelete(null)
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- Modals */

function SectionModal({
  open,
  section,
  saving,
  isAr,
  onClose,
  onSubmit,
}: {
  open: boolean
  section?: Section
  saving: boolean
  isAr: boolean
  onClose: () => void
  onSubmit: (values: SectionForm) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionFormInput, unknown, SectionForm>({
    resolver: zodResolver(sectionFormSchema),
    values: { title: section?.title ?? '', description: section?.description ?? '' },
  })

  return (
    <Modal
      open={open}
      title={
        section
          ? isAr
            ? 'تعديل بيانات الفصل'
            : 'Edit Section'
          : isAr
            ? 'إضافة فصل جديد للمنهج'
            : 'Add New Section'
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" loading={saving} onClick={handleSubmit(onSubmit)}>
            {section ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إضافة الفصل' : 'Add Section'}
          </Button>
        </>
      }
    >
      <FormField label={isAr ? 'عنوان الفصل' : 'Section Title'} error={errors.title?.message} required>
        <Input
          placeholder={isAr ? 'مثال: الوحدة الأولى: الأساسيات والبيئة التطويرية' : 'e.g. Module 1: Foundations and Setup'}
          invalid={Boolean(errors.title)}
          {...register('title')}
        />
      </FormField>

      <FormField label={isAr ? 'وصف الفصل (اختياري)' : 'Description (Optional)'} error={errors.description?.message}>
        <Textarea
          rows={3}
          placeholder={isAr ? 'اكتب ملخصاً للأهداف والموضوعات التي يغطيها هذا الفصل...' : 'Summarise the topics and goals covered in this section...'}
          {...register('description')}
        />
      </FormField>
    </Modal>
  )
}

function LessonModal({
  open,
  lesson,
  saving,
  isAr,
  onClose,
  onSubmit,
}: {
  open: boolean
  lesson?: Lesson
  saving: boolean
  isAr: boolean
  onClose: () => void
  onSubmit: (values: LessonForm) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LessonFormInput, unknown, LessonForm>({
    resolver: zodResolver(lessonFormSchema),
    values: {
      title: lesson?.title ?? '',
      type: lesson?.type ?? 'video',
      content: lesson?.content ?? '',
      video_url: lesson?.video_url ?? '',
      video_duration_seconds: lesson?.video_duration_seconds ?? undefined,
      duration_minutes: lesson?.duration_minutes ?? 0,
      is_preview: lesson?.is_preview ?? false,
      is_published: lesson?.is_published ?? true,
    },
  })

  const type = watch('type')

  return (
    <Modal
      open={open}
      title={
        lesson
          ? isAr
            ? 'تعديل الدرس'
            : 'Edit Lesson'
          : isAr
            ? 'إضافة درس جديد'
            : 'Add New Lesson'
      }
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button size="sm" loading={saving} onClick={handleSubmit(onSubmit)}>
            {lesson ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إضافة الدرس' : 'Add Lesson'}
          </Button>
        </>
      }
    >
      <FormField label={isAr ? 'عنوان الدرس' : 'Lesson Title'} error={errors.title?.message} required>
        <Input
          placeholder={isAr ? 'مثال: مقدمة في بنية الحالة في React 19' : 'e.g. Introduction to React 19 State Architecture'}
          invalid={Boolean(errors.title)}
          {...register('title')}
        />
      </FormField>

      <FormField label={isAr ? 'نوع محتوى الدرس' : 'Lesson Content Type'} error={errors.type?.message} required>
        <Select {...register('type')}>
          <option value="video">{isAr ? 'درس مرئي (فيديو)' : 'Video Lesson'}</option>
          <option value="article">{isAr ? 'مقال / قراءة نصية' : 'Article / Reading'}</option>
          <option value="quiz">{isAr ? 'اختبار تقييمي تفاعلي' : 'Interactive Quiz'}</option>
          <option value="assignment">{isAr ? 'واجب وتطبيق عملي' : 'Assignment Task'}</option>
          <option value="resource">{isAr ? 'مورد وملفات قابلة للتنزيل' : 'Downloadable Resource'}</option>
        </Select>
      </FormField>

      {type === 'video' || type === 'resource' ? (
        <>
          <FormField
            label={isAr ? 'رابط الفيديو (YouTube / Vimeo / MP4)' : 'Video URL or Stream Link'}
            error={errors.video_url?.message}
            hint={isAr ? 'يدعم روابط YouTube و Vimeo وملفات MP4 المباشرة.' : 'YouTube, Vimeo embed URLs, or direct MP4 links.'}
            required
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=…"
              invalid={Boolean(errors.video_url)}
              {...register('video_url')}
            />
          </FormField>

          <FormField
            label={isAr ? 'مدة الفيديو بالثواني' : 'Video Length (seconds)'}
            error={errors.video_duration_seconds?.message}
            hint={isAr ? 'تُستخدم لتتبع تقدم الطالب التلقائي.' : 'Used for automatic lesson completion and progress telemetry.'}
          >
            <Input type="number" min={0} {...register('video_duration_seconds')} />
          </FormField>
        </>
      ) : null}

      {type === 'article' ? (
        <FormField label={isAr ? 'نص المقال (Markdown)' : 'Article Body (Markdown / Text)'} error={errors.content?.message} required>
          <Textarea rows={8} invalid={Boolean(errors.content)} {...register('content')} />
        </FormField>
      ) : null}

      {type === 'quiz' || type === 'assignment' ? (
        <p className="text-xs text-text-muted p-3 rounded-2xl bg-surface-muted/60 border border-border">
          {isAr
            ? 'احفظ هذا الدرس أولاً، ثم انقر على زر الاختبار أو الواجب في قائمة المنهج لإعداد الأسئلة ومعايير التقييم.'
            : 'Save this lesson first, then click on the quiz or brief button on the curriculum list to author questions and rubric parameters.'}
        </p>
      ) : null}

      <FormField
        label={isAr ? 'المدة التقديرية (بالدقائق)' : 'Estimated Duration (minutes)'}
        error={errors.duration_minutes?.message}
        hint={isAr ? 'تظهر في قائمة المنهج لحساب إجمالي ساعات الكورس.' : 'Displayed in curriculum and used to calculate total course run-time.'}
      >
        <Input type="number" min={0} {...register('duration_minutes')} />
      </FormField>

      <div className="flex flex-col gap-2.5 pt-2">
        <Checkbox
          label={isAr ? 'معاينة مجانية متاحة للجميع' : 'Free Preview Lesson'}
          hint={isAr ? 'السماح للزوار بمشاهدة هذا الدرس قبل التسجيل أو الشراء.' : 'Allow visitors to preview this lesson without enrolling.'}
          {...register('is_preview')}
        />

        <Checkbox
          label={isAr ? 'منشور ومرئي للطلاب' : 'Published & Visible'}
          hint={isAr ? 'الدروس غير المنشورة تظل مخفية في مشغل الدورة.' : 'Unpublished lessons remain hidden from learner playback.'}
          {...register('is_published')}
        />
      </div>
    </Modal>
  )
}

