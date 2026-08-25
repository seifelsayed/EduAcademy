import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button'
import { Checkbox, Input, Textarea } from '@/components/atoms/inputs'
import { FormField } from '@/components/molecules/FormField'
import type { Lesson } from '@/core/domain/schemas/catalog'
import { assignmentFormSchema, type AssignmentForm, type AssignmentFormInput } from '@/core/domain/schemas/forms'
import { useAssignment, useSaveAssignment } from '@/features/assessment/hooks'
import { useTranslation } from '@/shared/lib/i18n'

interface AssignmentEditorProps {
  lesson: Lesson
}

export function AssignmentEditor({ lesson }: AssignmentEditorProps) {
  const existingId = (lesson.assignment as { id?: number } | null | undefined)?.id
  const { data: assignment } = useAssignment(existingId)
  const save = useSaveAssignment(lesson.id)
  const { isAr } = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentFormInput, unknown, AssignmentForm>({
    resolver: zodResolver(assignmentFormSchema),
    values: {
      title: assignment?.title ?? lesson.title,
      instructions: assignment?.instructions ?? '',
      max_points: assignment?.max_points ?? 100,
      due_at: assignment?.due_at ? assignment.due_at.slice(0, 16) : '',
      allow_late_submissions: assignment?.allow_late_submissions ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(values))} className="flex flex-col gap-4">
      <FormField label={isAr ? 'عنوان الواجب / المشروع' : 'Assignment Title'} error={errors.title?.message} required>
        <Input invalid={Boolean(errors.title)} {...register('title')} />
      </FormField>

      <FormField
        label={isAr ? 'نص التعليمات والمتطلبات التفصيلية' : 'Assignment Brief & Instructions'}
        error={errors.instructions?.message}
        hint={isAr ? 'اشرح متطلبات المشروع، معايير التقييم، وروابط المستودعات المطلوبة.' : 'Explain the project specifications, expected deliverables, and grading rubric.'}
      >
        <Textarea rows={6} placeholder={isAr ? 'اكتب تعليمات وشروط الواجب هنا...' : 'Specify requirements, repository links, submission guidelines...'} {...register('instructions')} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={isAr ? 'الدرجة القصوى' : 'Max Points'} error={errors.max_points?.message}>
          <Input type="number" min={1} max={1000} {...register('max_points')} />
        </FormField>

        <div className="sm:col-span-2">
          <FormField
            label={isAr ? 'تاريخ ووقت الموعد النهائي' : 'Due Date & Time'}
            error={errors.due_at?.message}
            hint={isAr ? 'اتركه فارغاً إذا لم يكن هناك موعد نهائي محدد.' : 'Leave empty if there is no deadline.'}
          >
            <Input type="datetime-local" {...register('due_at')} />
          </FormField>
        </div>
      </div>

      <Checkbox
        label={isAr ? 'قبول التسليمات المتأخرة بعد الموعد' : 'Accept late submissions'}
        hint={isAr ? 'سيتم قبول تسليمات الطلاب بعد الموعد ولكن ستوضع عليها إشارة "متأخر" في قائمة التقييم.' : 'Submissions after the due date will be accepted but flagged as late in the grading queue.'}
        {...register('allow_late_submissions')}
      />

      <div className="flex justify-end pt-3 border-t border-border">
        <Button size="sm" type="submit" loading={save.isPending}>
          {isAr ? 'حفظ إعدادات الواجب' : 'Save Assignment'}
        </Button>
      </div>
    </form>
  )
}

