import { zodResolver } from '@hookform/resolvers/zod'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Checkbox, Input, Select, Textarea } from '@/components/atoms/inputs'
import { FormField } from '@/components/molecules/FormField'
import {
  QUESTION_TYPE_LABELS,
  isOptionBased,
  type Question,
  type QuestionType,
} from '@/core/domain/schemas/assessment'
import type { Lesson } from '@/core/domain/schemas/catalog'
import {
  questionFormSchema,
  quizFormSchema,
  type QuestionForm,
  type QuestionFormInput,
  type QuizForm,
  type QuizFormInput,
} from '@/core/domain/schemas/forms'
import { useQuiz, useQuizMutations } from '@/features/assessment/hooks'
import { useTranslation, localizeErrorMessage } from '@/shared/lib/i18n'


interface QuizEditorProps {
  lesson: Lesson
}


export function QuizEditor({ lesson }: QuizEditorProps) {
  const existingQuizId = (lesson.quiz as { id?: number } | null | undefined)?.id
  const { data: quiz } = useQuiz(existingQuizId)
  const mutations = useQuizMutations(lesson.id, quiz?.id)
  const { isAr } = useTranslation()

  const [editing, setEditing] = useState<Question | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormInput, unknown, QuizForm>({
    resolver: zodResolver(quizFormSchema),
    values: {
      title: quiz?.title ?? lesson.title,
      description: quiz?.description ?? '',
      time_limit_minutes: quiz?.time_limit_minutes ?? '',
      passing_score: quiz?.passing_score ?? 60,
      max_attempts: quiz?.max_attempts ?? '',
      shuffle_questions: quiz?.shuffle_questions ?? false,
      show_correct_answers: quiz?.show_correct_answers ?? true,
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit((values) => mutations.saveQuiz.mutate(values))}
        className="flex flex-col gap-4"
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-text-muted m-0">
          {isAr ? 'إعدادات وقواعد الاختبار' : 'Quiz Configuration'}
        </h3>

        <FormField label={isAr ? 'عنوان الاختبار' : 'Quiz Title'} error={errors.title?.message} required>
          <Input invalid={Boolean(errors.title)} {...register('title')} />
        </FormField>

        <FormField label={isAr ? 'التعليمات والإرشادات' : 'Instructions & Description'} error={errors.description?.message}>
          <Textarea rows={2} placeholder={isAr ? 'اشرح شروط الاجتياز وعدد الأسئلة...' : 'Explain expectations, guidelines, and passing criteria...'} {...register('description')} />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label={isAr ? 'المدة الزمنية (بالدقائق)' : 'Time Limit (minutes)'}
            error={errors.time_limit_minutes?.message}
            hint={isAr ? 'اتركه فارغاً لوقت غير محدود.' : 'Leave empty for unlimited time.'}
          >
            <Input type="number" min={1} {...register('time_limit_minutes')} />
          </FormField>

          <FormField label={isAr ? 'درجة النجاح (%)' : 'Pass Benchmark (%)'} error={errors.passing_score?.message}>
            <Input type="number" min={0} max={100} {...register('passing_score')} />
          </FormField>

          <FormField
            label={isAr ? 'أقصى عدد محاولات' : 'Max Attempts Allowed'}
            error={errors.max_attempts?.message}
            hint={isAr ? 'اتركه فارغاً لمحاولات غير محدودة.' : 'Leave empty for unlimited attempts.'}
          >
            <Input type="number" min={1} {...register('max_attempts')} />
          </FormField>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Checkbox label={isAr ? 'ترتيب الأسئلة عشوائياً لكل محاولة' : 'Shuffle question order per attempt'} {...register('shuffle_questions')} />
          <Checkbox
            label={isAr ? 'إظهار الإجابات الصحيحة والتفسير بعد تسليم الاختبار' : 'Show correct answers & feedback after submission'}
            {...register('show_correct_answers')}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button size="sm" type="submit" loading={mutations.saveQuiz.isPending}>
            {isAr ? 'حفظ إعدادات الاختبار' : 'Save Quiz Settings'}
          </Button>
        </div>
      </form>

      <div className="border-t border-border pt-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-text-muted m-0">
            {isAr ? 'بنك أسئلة الاختبار' : 'Question Bank'}{' '}
            {quiz?.questions ? (
              <span className="font-normal text-text-muted font-mono">({quiz.questions.length})</span>
            ) : null}
          </h3>

          {quiz ? (
            <Button
              size="sm"
              icon={<IconPlus size={15} />}
              onClick={() => {
                setEditing(null)
                setShowQuestionForm(true)
              }}
            >
              {isAr ? 'إضافة سؤال' : 'Add Question'}
            </Button>
          ) : null}
        </div>

        {!quiz ? (
          <p className="text-xs text-text-muted m-0">
            {isAr
              ? 'احفظ إعدادات الاختبار بالأعلى أولاً للبدء في إضافة الأسئلة.'
              : 'Save the quiz configuration above first to begin adding questions.'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border bg-surface/90 backdrop-blur-md overflow-hidden">
              {(quiz.questions ?? []).map((question: Question, index: number) => (
                <div key={question.id} className="p-3.5 flex items-start gap-3 hover:bg-surface-hover/50 transition-colors">
                  <span className="text-xs font-mono font-bold text-text-muted w-5 tabular-nums mt-0.5">
                    {index + 1}.
                  </span>

                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-xs sm:text-sm text-text-main leading-snug">{question.prompt}</span>
                    <span className="text-[11px] text-text-muted">
                      {isAr ? (QUESTION_TYPE_LABELS_AR[question.type as QuestionType] ?? question.type) : QUESTION_TYPE_LABELS[question.type as QuestionType]} · {question.points} {isAr ? 'درجات' : 'points'}
                    </span>
                  </div>

                  <Badge tone="muted">{(question.options ?? []).length || '—'} {isAr ? 'خيارات' : 'options'}</Badge>


                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(question)
                        setShowQuestionForm(true)
                      }}
                    >
                      {isAr ? 'تعديل' : 'Edit'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Delete question"
                      icon={<IconTrash size={15} />}
                      className="text-text-muted hover:text-danger hover:bg-danger-light"
                      onClick={() => mutations.deleteQuestion.mutate(question.id)}
                    />
                  </div>
                </div>
              ))}

              {(quiz.questions ?? []).length === 0 ? (
                <div className="p-5 text-center text-xs text-text-muted">
                  {isAr ? 'لم يتم إضافة أي أسئلة لهذا الاختبار بعد.' : 'No questions created in this quiz yet.'}
                </div>
              ) : null}
            </div>

            {showQuestionForm ? (
              <QuestionForm
                key={editing?.id ?? 'new'}
                question={editing}
                isAr={isAr}
                saving={mutations.addQuestion.isPending || mutations.updateQuestion.isPending}
                onCancel={() => setShowQuestionForm(false)}
                onSubmit={(values) => {
                  if (editing) {
                    mutations.updateQuestion.mutate({ id: editing.id, input: values })
                  } else {
                    mutations.addQuestion.mutate({ quiz: quiz.id, input: values })
                  }

                  setShowQuestionForm(false)
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

const QUESTION_TYPE_LABELS_AR: Record<QuestionType, string> = {
  single_choice: 'اختيار من متعدد (إجابة واحدة)',
  multiple_choice: 'اختيارات متعددة (أكثر من إجابة)',
  true_false: 'صواب أو خطأ',
  short_answer: 'إجابة نصية قصيرة',
}

function QuestionForm({
  question,
  isAr,
  saving,
  onCancel,
  onSubmit,
}: {
  question: Question | null
  isAr: boolean
  saving: boolean
  onCancel: () => void
  onSubmit: (values: QuestionForm) => void
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuestionFormInput, unknown, QuestionForm>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      type: question?.type ?? 'single_choice',
      prompt: question?.prompt ?? '',
      explanation: question?.explanation ?? '',
      points: question?.points ?? 1,
      answer_key: question?.answer_key ?? '',
      options:
        question?.options?.map((option) => ({
          text: option.text,
          is_correct: option.is_correct ?? false,
        })) ?? [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
        ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'options' })
  const type = watch('type') as QuestionType

  return (
    <form
      className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-5 sm:p-6 shadow-md flex flex-col gap-4 mt-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h4 className="text-sm font-black text-text-main m-0">
        {question ? (isAr ? 'تعديل بيانات السؤال' : 'Edit Question') : isAr ? 'إضافة سؤال جديد' : 'Create New Question'}
      </h4>

      <FormField label={isAr ? 'نوع السؤال' : 'Question Type'} error={errors.type?.message} required>
        <Select {...register('type')}>
          {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {isAr ? (QUESTION_TYPE_LABELS_AR[value as QuestionType] ?? label) : label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label={isAr ? 'نص السؤال' : 'Question Prompt'} error={errors.prompt?.message} required>
        <Textarea
          rows={2}
          placeholder={isAr ? 'اكتب نص السؤال بوضوح...' : 'Write the question prompt clearly...'}
          invalid={Boolean(errors.prompt)}
          {...register('prompt')}
        />
      </FormField>

      <FormField label={isAr ? 'درجة / نقاط السؤال' : 'Points Value'} error={errors.points?.message}>
        <Input type="number" min={1} max={100} {...register('points')} />
      </FormField>

      {isOptionBased(type) ? (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            {isAr ? 'خيارات الإجابة (حدد علامة الصح أمام الإجابة الصحيحة)' : 'Answer Options (Check all that are correct)'}
          </span>

          {errors.options?.message ? (
            <div className="text-xs font-semibold text-danger" role="alert">
              {localizeErrorMessage(errors.options.message)}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div className="flex items-center gap-2" key={field.id}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-[4px] border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  aria-label={`Option ${index + 1} is correct`}
                  {...register(`options.${index}.is_correct` as const)}
                />

                <Input
                  placeholder={isAr ? `الخيار رقم ${index + 1}` : `Option ${index + 1}`}
                  invalid={Boolean(errors.options?.[index]?.text)}
                  {...register(`options.${index}.text` as const)}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remove option ${index + 1}`}
                  icon={<IconTrash size={15} />}
                  className="text-text-muted hover:text-danger hover:bg-danger-light shrink-0"
                  disabled={fields.length <= 2}
                  onClick={() => remove(index)}
                />
              </div>
            ))}
          </div>

          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              icon={<IconPlus size={15} />}
              disabled={fields.length >= 10}
              onClick={() => append({ text: '', is_correct: false })}
            >
              {isAr ? 'إضافة خيار بديل' : 'Add Option Choice'}
            </Button>
          </div>
        </div>
      ) : (
        <FormField
          label={isAr ? 'مفتاح الإجابات المقبولة' : 'Accepted Answers Key'}
          error={errors.answer_key?.message}
          hint={isAr ? 'افصل بين الإجابات البديلة بـ "|" (مثال: البرمجة كائنية التوجه|OOP)' : 'Separate alternatives with "|" — matching ignores case and extra whitespace.'}
          required
        >
          <Input
            placeholder={isAr ? 'مثال: React|رياكت' : 'e.g. dependency injection|DI'}
            invalid={Boolean(errors.answer_key)}
            {...register('answer_key')}
          />
        </FormField>
      )}

      <FormField
        label={isAr ? 'تفسير الإجابة وتوضيح الحل (اختياري)' : 'Explanation / Rationale'}
        error={errors.explanation?.message}
        hint={isAr ? 'يظهر للطالب بعد تسليم الاختبار لشرح سبب صحة الإجابة.' : 'Shown to learners upon quiz completion when answers are revealed.'}
      >
        <Textarea rows={2} placeholder={isAr ? 'اكتب ملاحظات توضيحية للحل...' : 'Explain the solution rationale...'} {...register('explanation')} />
      </FormField>

      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button size="sm" type="submit" loading={saving}>
          {question ? (isAr ? 'حفظ السؤال' : 'Save Question') : isAr ? 'إضافة السؤال' : 'Add Question'}
        </Button>
      </div>
    </form>
  )
}

