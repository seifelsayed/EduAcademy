import {
  IconAlarm,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconHelpCircle,
} from '@tabler/icons-react'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/inputs'
import { Markdown } from '@/components/atoms/Markdown'
import { isOptionBased, type Question, type Quiz, type QuizResult } from '@/core/domain/schemas/assessment'
import { formatClock } from '@/shared/lib/format'
import { useTranslation } from '@/shared/lib/i18n'


export interface QuizAnswerInput {
  question_id: number
  option_ids?: number[]
  text?: string | null
}

interface QuizRunnerProps {
  quiz: Quiz
  secondsRemaining?: number
  submitting?: boolean
  onSubmit: (answers: QuizAnswerInput[]) => void
  /** Present after submission; switches the view into review mode. */
  result?: QuizResult | null
}

const OPTION_LETTERS_EN = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const OPTION_LETTERS_AR = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح']

export function QuizRunner({
  quiz,
  secondsRemaining,
  submitting = false,
  onSubmit,
  result,
}: QuizRunnerProps) {
  const { isAr } = useTranslation()
  const questions = useMemo(() => quiz.questions ?? [], [quiz.questions])

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, QuizAnswerInput>>({})
  const [remaining, setRemaining] = useState(secondsRemaining ?? null)

  const isReview = Boolean(result)

  useEffect(() => {
    if (remaining === null || isReview) return

    if (remaining <= 0) {
      onSubmit(Object.values(answers))
      return
    }

    const timer = window.setTimeout(() => setRemaining((value) => (value ?? 1) - 1), 1000)

    return () => window.clearTimeout(timer)
  }, [remaining, isReview, answers, onSubmit])

  if (questions.length === 0) {
    return (
      <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl p-8 text-center text-text-muted">
        {isAr ? 'لا توجد أسئلة مضافة لهذا الاختبار بعد.' : 'This quiz has no questions yet.'}
      </div>
    )
  }

  const question = questions[index]

  if (!question) return null

  const answered = Object.keys(answers).length
  const verdict = result?.breakdown.find((entry) => entry.question_id === question.id)

  const setOptionAnswer = (optionId: number, multiple: boolean) => {
    setAnswers((current) => {
      const existing = current[question.id]?.option_ids ?? []

      const option_ids = multiple
        ? existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId]
        : [optionId]

      return { ...current, [question.id]: { question_id: question.id, option_ids } }
    })
  }

  const setTextAnswer = (text: string) => {
    setAnswers((current) => ({ ...current, [question.id]: { question_id: question.id, text } }))
  }

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-lg overflow-hidden flex flex-col transition-all">
      {/* Quiz Runner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-7 sm:py-5 border-b border-border bg-surface-muted/40">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shrink-0">
            {index + 1}
          </span>
          <div>
            <h3 className="font-heading font-black text-base sm:text-lg text-text-main m-0 leading-tight">
              {quiz.title}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 mb-0 flex items-center gap-2">
              <span>
                {isAr
                  ? `السؤال ${index + 1} من ${questions.length}`
                  : `Question ${index + 1} of ${questions.length}`}
              </span>
              <span>·</span>
              <span className="font-bold text-text-main">
                {question.points} {isAr ? (question.points === 1 ? 'درجة' : 'درجات') : question.points === 1 ? 'point' : 'points'}
              </span>
            </p>
          </div>
        </div>

        {remaining !== null && !isReview ? (
          <div
            className={clsx(
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-black font-mono transition-all shadow-xs self-start sm:self-auto',
              remaining < 60
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 animate-pulse'
                : remaining < 180
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-600'
                  : 'bg-surface border-border text-text-main',
            )}
          >
            <IconAlarm size={16} />
            <span>{formatClock(remaining)}</span>
          </div>
        ) : null}
      </div>

      {/* Progress Telemetry */}
      <div className="px-5 sm:px-7 pt-4 pb-1">
        <div className="flex items-center justify-between text-xs font-bold text-text-muted mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {isAr
              ? `تمت الإجابة على ${answered} من أصل ${questions.length} سؤال`
              : `${answered} of ${questions.length} questions answered`}
          </span>
          <span className="font-mono text-primary">
            {Math.round((answered / questions.length) * 100)}%
          </span>
        </div>

        {/* Question Stepper Indicator Dots */}
        <div className="grid grid-flow-col auto-cols-fr gap-1.5 w-full">
          {questions.map((q, qIndex) => {
            const hasAnswer = isOptionBased(q.type)
              ? (answers[q.id]?.option_ids?.length ?? 0) > 0
              : Boolean(answers[q.id]?.text?.trim())

            const qVerdict = result?.breakdown.find((entry) => entry.question_id === q.id)

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setIndex(qIndex)}
                className={clsx(
                  'h-2 rounded-full transition-all cursor-pointer border',
                  qIndex === index
                    ? 'ring-2 ring-primary ring-offset-1 bg-primary border-primary'
                    : isReview
                      ? qVerdict?.is_correct
                        ? 'bg-emerald-500 border-emerald-600'
                        : 'bg-rose-500 border-rose-600'
                      : hasAnswer
                        ? 'bg-primary/80 border-primary'
                        : 'bg-surface-muted border-border hover:bg-surface-hover',
                )}
                title={`${isAr ? 'السؤال' : 'Question'} ${qIndex + 1}`}
              />
            )
          })}
        </div>
      </div>

      {/* Question Content Area */}
      <div className="p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Badge tone="muted">
            {question.type === 'multiple_choice'
              ? isAr ? 'اختيار متعدد (أكثر من إجابة)' : 'Multiple Choice'
              : question.type === 'single_choice'
                ? isAr ? 'اختيار من متعدد' : 'Single Choice'
                : isAr ? 'إجابة نصية قصيرة' : 'Short Answer'}
          </Badge>
        </div>

        <div className="bg-surface-muted/40 border border-border/70 rounded-2xl p-5 sm:p-6">
          <Markdown
            content={question.prompt}
            className="font-bold text-base sm:text-lg text-text-main leading-relaxed [&_p]:mb-0"
          />
        </div>

        {isOptionBased(question.type) ? (
          <OptionList
            question={question}
            selected={answers[question.id]?.option_ids ?? []}
            disabled={isReview}
            isAr={isAr}
            revealAnswers={isReview && (result?.show_correct_answers ?? false)}
            onSelect={(optionId) => setOptionAnswer(optionId, question.type === 'multiple_choice')}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-text-muted">
              {isAr ? 'اكتب إجابتك هنا:' : 'Type your answer below:'}
            </label>
            <Input
              value={answers[question.id]?.text ?? ''}
              onChange={(event) => setTextAnswer(event.target.value)}
              placeholder={isAr ? 'اكتب الإجابة...' : 'Type your answer here...'}
              disabled={isReview}
              className="py-3 px-4 rounded-2xl text-sm"
              aria-label="Your answer"
            />
          </div>
        )}

        {isReview && verdict ? (
          <div
            className={clsx(
              'p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm flex flex-col gap-2 shadow-xs',
              verdict.is_correct
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200',
            )}
            role="status"
          >
            <div className="flex items-center gap-2 font-black text-sm sm:text-base">
              {verdict.is_correct ? (
                <IconCircleCheck size={20} className="text-emerald-500 shrink-0" />
              ) : (
                <IconCircleX size={20} className="text-rose-500 shrink-0" />
              )}
              <span>
                {verdict.is_correct
                  ? isAr
                    ? `إجابة صحيحة! حصلت على ${verdict.earned_points} من ${verdict.points} درجات.`
                    : `Correct! Awarded ${verdict.earned_points} of ${verdict.points} points.`
                  : isAr
                    ? `إجابة غير صحيحة — 0 من ${verdict.points} درجات.`
                    : `Incorrect — 0 of ${verdict.points} points.`}
              </span>
            </div>

            {question.explanation ? (
              <div className="mt-1 pt-2.5 border-t border-current/10">
                <span className="font-bold block mb-1 text-xs uppercase tracking-wider opacity-80">
                  {isAr ? 'التفسير والتعليل:' : 'Explanation:'}
                </span>
                <Markdown
                  content={question.explanation}
                  className="text-xs leading-relaxed opacity-90 [&_p]:my-1"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Navigation and Submit Footer */}
      <div className="flex items-center justify-between gap-3 p-5 sm:px-7 py-4 border-t border-border bg-surface-muted/40 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          icon={isAr ? <IconArrowRight size={15} /> : <IconArrowLeft size={15} />}
          onClick={() => setIndex((i) => i - 1)}
          disabled={index === 0}
        >
          {isAr ? 'السؤال السابق' : 'Previous'}
        </Button>

        <div className="flex items-center gap-2.5">
          {index < questions.length - 1 ? (
            <Button
              size="sm"
              iconRight={isAr ? <IconArrowLeft size={15} /> : <IconArrowRight size={15} />}
              onClick={() => setIndex((i) => i + 1)}
            >
              {isAr ? 'السؤال التالي' : 'Next'}
            </Button>
          ) : null}

          {!isReview ? (
            <Button
              size="sm"
              variant={answered === questions.length ? 'primary' : 'secondary'}
              className={answered === questions.length ? 'shadow-md font-black' : ''}
              onClick={() => onSubmit(Object.values(answers))}
              loading={submitting}
              disabled={answered === 0}
              iconRight={<IconCheck size={16} />}
            >
              {isAr ? 'تسليم الاختبار الآن' : 'Submit Quiz'}
            </Button>
          ) : null}

        </div>
      </div>
    </div>
  )
}

interface OptionListProps {
  question: Question
  selected: number[]
  disabled: boolean
  isAr: boolean
  revealAnswers: boolean
  onSelect: (optionId: number) => void
}

function OptionList({
  question,
  selected,
  disabled,
  isAr,
  revealAnswers,
  onSelect,
}: OptionListProps) {
  const isMultiple = question.type === 'multiple_choice'
  const letters = isAr ? OPTION_LETTERS_AR : OPTION_LETTERS_EN

  return (
    <div className="flex flex-col gap-2.5" role={isMultiple ? 'group' : 'radiogroup'}>
      {(question.options ?? []).map((option, optIdx) => {
        const isSelected = selected.includes(option.id)
        const showCorrect = revealAnswers && option.is_correct === true
        const showWrong = revealAnswers && isSelected && option.is_correct !== true
        const letter = letters[optIdx % letters.length]

        return (
          <label
            key={option.id}
            className={clsx(
              'flex items-center gap-3.5 p-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all select-none',
              isSelected && !revealAnswers
                ? 'bg-primary/10 border-primary text-text-main shadow-xs ring-2 ring-primary/20'
                : 'bg-surface border-border text-text-muted hover:text-text-main hover:bg-surface-hover/70 hover:border-border-hover',
              showCorrect && 'border-emerald-600 bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30',
              showWrong && 'border-rose-600 bg-rose-500/15 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/30',
              disabled ? 'cursor-default' : 'cursor-pointer',
            )}
          >
            {/* Option Letter Pill */}
            <span
              className={clsx(
                'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors',
                isSelected && !revealAnswers
                  ? 'bg-primary text-white'
                  : showCorrect
                    ? 'bg-emerald-600 text-white'
                    : showWrong
                      ? 'bg-rose-600 text-white'
                      : 'bg-surface-muted text-text-muted border border-border',
              )}
            >
              {showCorrect ? <IconCheck size={14} /> : letter}
            </span>

            <input
              type={isMultiple ? 'checkbox' : 'radio'}
              className="sr-only"
              name={`question-${question.id}`}
              checked={isSelected}
              disabled={disabled}
              onChange={() => onSelect(option.id)}
            />

            <span className="flex-1 min-w-0 break-words leading-snug">{option.text}</span>
          </label>
        )
      })}

      {isMultiple ? (
        <p className="text-xs text-text-subtle mt-1 mb-0 flex items-center gap-1">
          <IconHelpCircle size={14} />
          <span>{isAr ? 'يمكنك اختيار أكثر من إجابة صحيحة.' : 'Select all options that apply.'}</span>
        </p>
      ) : null}
    </div>
  )
}

