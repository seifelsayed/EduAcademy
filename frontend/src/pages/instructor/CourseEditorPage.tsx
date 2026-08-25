import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconAlertTriangle,
  IconArchive,
  IconArrowRight,
  IconBulb,
  IconCircleCheck,
  IconCoin,
  IconEye,
  IconFileDescription,
  IconFolder,
  IconListCheck,
  IconPhoto,
  IconPlayerPlay,
  IconSettings,
  IconSparkles,
  IconTarget,
  IconTrash,
  IconUpload,
  IconUsers,
  IconWorldUpload,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input, Select, Textarea } from '@/components/atoms/inputs'
import { CenteredSpinner } from '@/components/atoms/Spinner'
import { CategoryCombobox } from '@/components/molecules/CategoryCombobox'
import { ConfirmDialog } from '@/components/molecules/Modal'
import { FormField } from '@/components/molecules/FormField'
import { StringListEditor } from '@/components/molecules/StringListEditor'
import { PageHeader } from '@/components/templates/PageHeader'
import {
  COURSE_LEVEL_LABELS,
  type CourseDetail,
  type CourseLevel,
} from '@/core/domain/schemas/catalog'
import { courseFormSchema, type CourseForm, type CourseFormInput } from '@/core/domain/schemas/forms'
import { useTranslation, localizeErrorMessage } from '@/shared/lib/i18n'

import {
  useCategories,
  useCourse,
  useCourseReadiness,
  useCourseStatusActions,
  useCreateCourse,
  useDeleteCourse,
  useUpdateCourse,
} from '@/features/catalog/hooks'

export function CourseEditorPage() {
  const { slug } = useParams<{ slug?: string }>()
  const isNew = slug === undefined
  const { t } = useTranslation()

  const { data, isLoading } = useCourse(isNew ? undefined : slug)

  if (!isNew && isLoading) return <CenteredSpinner label={t('editor.loadingCourse')} />

  return <CourseEditorForm key={slug ?? 'new'} slug={slug} course={data?.course} />
}

interface CourseEditorFormProps {
  slug?: string
  course?: CourseDetail
}

function CourseEditorForm({ slug, course }: CourseEditorFormProps) {
  const isNew = slug === undefined
  const { t, isAr } = useTranslation()

  const categories = useCategories()
  const create = useCreateCourse()
  const update = useUpdateCourse(slug ?? '')
  const remove = useDeleteCourse()
  const statusActions = useCourseStatusActions(slug ?? '')
  const readiness = useCourseReadiness(isNew ? undefined : slug)

  const thumbnailInput = useRef<HTMLInputElement>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormInput, unknown, CourseForm>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title ?? '',
      subtitle: course?.subtitle ?? '',
      description: course?.description ?? '',
      category_id: course?.category?.id,
      level: course?.level ?? 'all_levels',
      language: course?.language ?? 'Arabic',
      price: course ? course.price.amount_cents / 100 : 0,
      discount_price:
        course?.price.discount_cents != null ? course.price.discount_cents / 100 : '',
      promo_video_url: course?.promo_video_url ?? '',
      requirements: course?.requirements ?? [],
      outcomes: course?.outcomes ?? [],
      target_audience: course?.target_audience ?? [],
    },
  })

  const outcomes = watch('outcomes') ?? []
  const requirements = watch('requirements') ?? []
  const audience = watch('target_audience') ?? []
  const selectedCategoryId = watch('category_id') ? Number(watch('category_id')) : undefined
  const priceValue = watch('price')

  const onSubmit = (values: CourseForm) => {
    const payload = {
      ...values,
      discount_price: values.discount_price === '' ? null : values.discount_price,
      promo_video_url: values.promo_video_url === '' ? null : values.promo_video_url,
    }

    if (isNew) {
      create.mutate({ input: payload as CourseForm, thumbnail })
      return
    }

    update.mutate({ input: payload as CourseForm, thumbnail })
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12">
      <PageHeader
        pretitle={t('editor.courseManagement')}
        title={isNew ? (isAr ? 'إنشاء دورة تدريبية جديدة' : 'Create New Course') : (course?.title ?? t('editor.editCourse'))}
        breadcrumbs={[
          { label: t('navigation.home'), to: '/' },
          { label: t('dash.myTaughtCourses'), to: '/teach/courses' },
          { label: isNew ? (isAr ? 'دورة جديدة' : 'New Course') : (course?.title ?? t('editor.editCourse')) },
        ]}
        actions={
          !isNew && course ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link to={`/teach/courses/${slug}/curriculum`} className="no-underline">
                <Button variant="outline" size="sm" icon={<IconListCheck size={15} />}>
                  {isAr ? 'إدارة المنهج والاختبارات' : 'Curriculum & Quizzes'}
                </Button>
              </Link>
              <Link to={`/teach/courses/${slug}/students`} className="no-underline">
                <Button variant="outline" size="sm" icon={<IconUsers size={15} />}>
                  {isAr ? 'الطلاب المسجلون' : 'Students'}
                </Button>
              </Link>
              <Link to={`/courses/${slug}`} className="no-underline">
                <Button variant="secondary" size="sm" icon={<IconEye size={15} />}>
                  {t('editor.publicPreview')}
                </Button>
              </Link>
            </div>
          ) : null
        }
      />

      {/* Creation Journey Stepper Banner */}
      {isNew ? (
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-5 sm:p-6 text-white border border-white/10 shadow-lg overflow-hidden flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
              <IconSparkles size={16} className="text-yellow-300" />
              <span>{isAr ? 'خارطة طريق بناء الدورة التعليمية' : 'Course Authoring Roadmap'}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              {isAr ? 'الخطوة 1 من 4' : 'Step 1 of 4'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/15 border border-white/20 font-bold text-cyan-200 shadow-2xs">
              {isAr ? '1. تفاصيل الكورس (هنا)' : '1. Basic Details'}
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-medium">
              {isAr ? '2. المنهج والدروس' : '2. Lessons & Media'}
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-medium">
              {isAr ? '3. بنك الأسئلة والاختبارات' : '3. Quiz & Assessment'}
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-medium">
              {isAr ? '4. الجاهزية والنشر' : '4. Publish Live'}
            </div>
          </div>

          <p className="text-xs text-slate-300 m-0 leading-relaxed">
            {isAr
              ? 'بعد حفظ المعلومات الأساسية، ستنتقل مباشرة إلى محرر المنهج لإضافة الأقسام، الفيديوهات، المقالات، وإنشاء الاختبارات التفاعلية خطوة بخطوة.'
              : 'After saving initial info, you will proceed directly to authoring video lessons, articles, and interactive quizzes.'}
          </p>
        </div>
      ) : (
        /* Course Sub-navigation for existing courses */
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface/90 backdrop-blur-md border border-border w-fit shadow-xs overflow-x-auto max-w-full">
          <Link
            to={`/teach/courses/${slug}`}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-xs no-underline shrink-0 flex items-center gap-1.5"
          >
            <IconSettings size={14} />
            <span>{isAr ? 'تفاصيل الكورس' : 'Course Details'}</span>
          </Link>
          <Link
            to={`/teach/courses/${slug}/curriculum`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface-hover no-underline shrink-0 flex items-center gap-1.5"
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
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Main Content Form Cards */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* CARD 1: Basic Information */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <IconFileDescription size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                  {isAr ? 'المعلومات الأساسية والوصف' : 'Basic Information & Overview'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'العنوان الجذاب، النبذة المختصرة، والوصف الشامل لمحتوى الدورة' : 'Course title, subtitle, and detailed curriculum description'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <FormField label={t('editor.courseTitleLabel')} error={errors.title?.message} required>
                <Input
                  placeholder={t('editor.courseTitlePlaceholder')}
                  invalid={Boolean(errors.title)}
                  {...register('title')}
                />
              </FormField>

              <FormField
                label={t('editor.subtitleLabel')}
                error={errors.subtitle?.message}
                hint={t('editor.subtitleHint')}
              >
                <Input
                  placeholder={t('editor.subtitlePlaceholder')}
                  {...register('subtitle')}
                />
              </FormField>

              <FormField label={t('editor.descriptionLabel')} error={errors.description?.message}>
                <Textarea
                  rows={5}
                  placeholder={t('editor.descriptionPlaceholder')}
                  {...register('description')}
                />
              </FormField>
            </div>
          </div>

          {/* CARD 2: Classification, Category & Level */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                <IconFolder size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                  {isAr ? 'التصنيف والمستوى واللغة' : 'Category, Level & Language'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'حدد تخصص الدورة، المستوى المناسب للمتعلمين ولغة الشرح' : 'Choose taxonomy category, skill level, and delivery language'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t('editor.categoryLabel')} error={errors.category_id?.message}>
                  <CategoryCombobox
                    categories={categories.data ?? []}
                    value={selectedCategoryId}
                    onChange={(val) => setValue('category_id', val ?? undefined, { shouldValidate: true })}
                    error={errors.category_id?.message}
                  />
                </FormField>

                <FormField label={t('editor.levelLabel')} error={errors.level?.message}>
                  <Select {...register('level')}>
                    {Object.keys(COURSE_LEVEL_LABELS).map((value) => (
                      <option key={value} value={value as CourseLevel}>
                        {t(`common.level.${value === 'all_levels' ? 'all' : value}`)}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label={t('editor.languageLabel')} error={errors.language?.message}>
                <Input placeholder={isAr ? 'مثال: العربية، English' : 'e.g. English, Arabic'} {...register('language')} />
              </FormField>
            </div>
          </div>

          {/* CARD 3: Pricing & Promotion */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                <IconCoin size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                  {isAr ? 'التسعير والعروض الترويجية' : 'Pricing & Promotion'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'حدد سعر الدورة الأساسي وسعر الخصم الاختياري (اتركه 0 للدورات المجانية)' : 'Set course base price and optional promotional discount (0 for free)'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t('editor.priceLabel')} error={errors.price?.message} hint={t('editor.priceHint')}>
                  <Input type="number" min={0} step="0.01" placeholder="0.00" {...register('price')} />
                </FormField>

                <FormField label={t('editor.discountLabel')} error={errors.discount_price?.message}>
                  <Input type="number" min={0} step="0.01" placeholder={isAr ? 'سعر ترويجي اختياري' : 'Optional discount price'} {...register('discount_price')} />
                </FormField>
              </div>

              {Number(priceValue) === 0 ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <IconCircleCheck size={16} className="shrink-0" />
                  <span>{isAr ? 'ستكون هذه الدورة متاحة لجميع الطلاب مجاناً بدون الحاجة لشراء أو دفع.' : 'This course will be published as Free for all learners.'}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* CARD 4: Course Media & Thumbnail */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                <IconPhoto size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                  {isAr ? 'صورة الغلاف والفيديو الترويجي' : 'Course Media & Cover Thumbnail'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'صورة غلاف جذابة وفيديو تشويقي لزيادة رغبة واهتمام الطلاب بالتسجيل' : 'Visual assets and promotional preview video to engage learners'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <FormField
                label={t('editor.promoVideoLabel')}
                error={errors.promo_video_url?.message}
                hint={isAr ? 'يدعم روابط YouTube أو Vimeo أو مقاطع الفيديو المباشرة' : 'Supports YouTube, Vimeo, or direct MP4 URLs'}
              >
                <div className="relative">
                  <Input placeholder="https://youtube.com/watch?v=…" {...register('promo_video_url')} />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none">
                    <IconPlayerPlay size={16} />
                  </span>
                </div>
              </FormField>

              {/* Course Thumbnail Upload Area */}
              <div className="p-4 rounded-2xl bg-surface-muted/30 border border-border">
                <span className="block text-xs font-black uppercase tracking-wider text-text-muted mb-3">
                  {t('editor.thumbnail')}
                </span>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {preview ?? course?.thumbnail_url ? (
                    <img
                      src={preview ?? course?.thumbnail_url ?? ''}
                      alt="Course thumbnail preview"
                      className="rounded-2xl w-44 aspect-video object-cover border border-border shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-44 aspect-video rounded-2xl bg-surface border border-dashed border-border flex flex-col items-center justify-center text-xs text-text-subtle shrink-0 gap-1">
                      <IconPhoto size={24} className="text-text-subtle/60" />
                      <span>{t('editor.noImage')}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<IconUpload size={15} />}
                      onClick={() => thumbnailInput.current?.click()}
                    >
                      {t('editor.uploadThumbnail')}
                    </Button>
                    <p className="text-[11px] text-text-muted m-0 leading-relaxed">{t('editor.thumbnailHint')}</p>

                    <input
                      ref={thumbnailInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        setThumbnail(file)
                        setPreview(URL.createObjectURL(file))
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: Outcomes, Prerequisites & Target Audience */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border bg-surface-muted/40 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                <IconTarget size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-text-main m-0">
                  {isAr ? 'الأهداف والمتطلبات والجمهور المستهدف' : 'Outcomes, Requirements & Target Audience'}
                </h2>
                <p className="text-xs text-text-muted m-0 mt-0.5">
                  {isAr ? 'حدد ما سيتعلمه الطالب، المتطلبات المسبقة، والفئات المستهدفة' : 'Define learning outcomes, prerequisites, and student audience'}
                </p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <StringListEditor
                label={t('editor.outcomesLabel')}
                values={outcomes}
                onChange={(values) => setValue('outcomes', values, { shouldDirty: true })}
                placeholder={t('editor.outcomesPlaceholder')}
              />

              <StringListEditor
                label={t('editor.requirementsLabel')}
                values={requirements}
                onChange={(values) => setValue('requirements', values, { shouldDirty: true })}
                placeholder={t('editor.requirementsPlaceholder')}
              />

              <StringListEditor
                label={t('editor.audienceLabel')}
                values={audience}
                onChange={(values) => setValue('target_audience', values, { shouldDirty: true })}
                placeholder={t('editor.audiencePlaceholder')}
              />
            </div>
          </div>

          {/* CARD 6: Form Actions Bottom Bar */}
          <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 flex-wrap">
            {!isNew ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<IconTrash size={15} />}
                className="text-text-muted hover:text-danger hover:bg-danger-light"
                onClick={() => setConfirmDelete(true)}
              >
                {isAr ? 'حذف الكورس' : 'Delete Course'}
              </Button>
            ) : (
              <Link to="/teach/courses" className="no-underline">
                <Button type="button" variant="ghost" size="sm">
                  {isAr ? 'إلغاء والعودة' : 'Cancel'}
                </Button>
              </Link>
            )}

            <Button
              size="md"
              type="submit"
              className="shadow-md font-black ms-auto"
              loading={create.isPending || update.isPending}
              iconRight={isNew ? (isAr ? <IconArrowRight size={16} className="rotate-180" /> : <IconArrowRight size={16} />) : undefined}
            >
              {isNew
                ? (isAr ? 'حفظ ومتابعة إلى المنهج والاختبارات' : 'Save & Continue to Curriculum & Quizzes')
                : (isAr ? 'حفظ التعديلات' : t('common.save'))}
            </Button>
          </div>
        </div>

        {/* Sidebar Column (4 Columns) */}
        <aside className="lg:col-span-4 flex flex-col gap-5 sticky top-24">
          {!isNew && course ? (
            <>
              {/* Existing Course: Publishing Status */}
              <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-text-main m-0">
                    {isAr ? 'حالة النشر' : 'Publishing Status'}
                  </h2>
                  <Badge tone={course.status === 'published' ? 'success' : 'warning'}>
                    {t(`common.${course.status}`)}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  {course.status === 'published' ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => statusActions.unpublish.mutate()}
                        loading={statusActions.unpublish.isPending}
                      >
                        {isAr ? 'إعادة إلى المسودات' : 'Move Back to Draft'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth
                        icon={<IconArchive size={15} />}
                        onClick={() => statusActions.archive.mutate()}
                        loading={statusActions.archive.isPending}
                      >
                        {isAr ? 'أرشفة الكورس' : 'Archive Course'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      fullWidth
                      icon={<IconWorldUpload size={15} />}
                      onClick={() => statusActions.publish.mutate()}
                      loading={statusActions.publish.isPending}
                      disabled={readiness.data?.is_ready === false}
                    >
                      {isAr ? 'نشر الكورس للعامة' : 'Publish Course Live'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Existing Course: Readiness Checklist */}
              <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 shadow-xs flex flex-col gap-3">
                <h2 className="text-sm font-black text-text-main m-0">
                  {isAr ? 'قائمة جاهزية النشر' : 'Publishing Checklist'}
                </h2>

                {readiness.isLoading ? (
                  <p className="text-xs text-text-muted m-0">
                    {isAr ? 'جاري فحص وتدقيق اكتمال متطلبات الكورس...' : 'Validating course completeness…'}
                  </p>
                ) : readiness.data?.is_ready ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-bold">
                    <IconCircleCheck size={16} />
                    <span>{isAr ? 'الكورس جاهز للنشر بنسبة 100%!' : 'Ready to publish! All requirements met.'}</span>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2 list-none p-0 m-0 text-xs text-text-muted">
                    {readiness.data?.problems.map((problem) => (
                      <li className="flex items-start gap-2 text-text-main p-2.5 rounded-2xl bg-surface-muted/50 border border-border/60 text-xs font-medium" key={problem}>
                        <IconAlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{localizeErrorMessage(problem)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            /* New Course Authoring Tips Card */
            <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <IconBulb size={18} />
                <span>{isAr ? 'إرشادات بناء محتوى متميز' : 'Instructor Quick Tips'}</span>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-text-muted leading-relaxed">
                <div className="p-3 rounded-2xl bg-surface-muted/50 border border-border/60 flex flex-col gap-1">
                  <span className="font-bold text-text-main">
                    {isAr ? 'العنوان والوصف' : 'Compelling Title'}
                  </span>
                  <span>
                    {isAr
                      ? 'اختر عنواناً واضحاً ومباشراً يعبّر عن القيمة العملية التي سيكتسبها المتعلم.'
                      : 'Choose a clear title stating what practical skills learners will acquire.'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-muted/50 border border-border/60 flex flex-col gap-1">
                  <span className="font-bold text-text-main">
                    {isAr ? 'صورة الغلاف المثالية' : 'Optimal Thumbnail'}
                  </span>
                  <span>
                    {isAr
                      ? 'استخدم صورة بدقة 1280×720 ونسبة أبعاد 16:9 بنصوص واضحة وغير مزدحمة.'
                      : 'Use 16:9 ratio (1280x720) with high contrast and legible typography.'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-surface-muted/50 border border-border/60 flex flex-col gap-1">
                  <span className="font-bold text-text-main">
                    {isAr ? 'ماذا بعد هذه الخطوة؟' : 'What is next?'}
                  </span>
                  <span>
                    {isAr
                      ? 'بعد الحفظ ستنتقل فوراً لإنشاء الفصول، رفع الفيديوهات، وإعداد الاختبارات التفاعلية والواجبات.'
                      : 'After saving, you will immediately build sections, upload video lessons, and author interactive quizzes.'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title={t('editor.deleteTitle')}
        message={t('editor.deleteBody')}
        confirmLabel={t('editor.deleteConfirm')}
        destructive
        loading={remove.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (slug) remove.mutate(slug)
          setConfirmDelete(false)
        }}
      />
    </div>
  )
}


