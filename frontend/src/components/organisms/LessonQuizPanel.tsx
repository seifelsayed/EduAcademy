import {
  IconAlertCircle,
  IconCircleCheck,
  IconRotateClockwise,
  IconTrophy,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { QuizRunner, type QuizAnswerInput } from '@/components/organisms/QuizRunner'
import type { Quiz, QuizResult } from '@/core/domain/schemas/assessment'
import { useAttemptHistory, useStartAttempt, useSubmitAttempt } from '@/features/assessment/hooks'
import { formatDate } from '@/shared/lib/format'
import { useTranslation } from '@/shared/lib/i18n'

interface LessonQuizPanelProps {
  quizId: number
  courseSlug: string
}

export function LessonQuizPanel({ quizId, courseSlug }: LessonQuizPanelProps) {
  const { isAr } = useTranslation()

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [attemptId, setAttemptId] = useState<number | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState<number | undefined>(undefined)
  const [result, setResult] = useState<QuizResult | null>(null)

  const history = useAttemptHistory(quizId)
  const start = useStartAttempt()
  const submit = useSubmitAttempt(courseSlug)

  const usedAttempts = Number(history.data?.extra.used_attempts ?? 0)
  const maxAttempts = history.data?.extra.max_attempts as number | null | undefined
  const bestScore = history.data?.extra.best_score as number | null | undefined
  const attemptsExhausted = maxAttempts != null && usedAttempts >= maxAttempts

  const beginAttempt = () => {
    setResult(null)

    start.mutate(quizId, {
      onSuccess: (payload) => {
        setActiveQuiz(payload.quiz)
        setAttemptId(payload.attempt.id)
        setSecondsRemaining(payload.attempt.seconds_remaining)
      },
    })
  }

  const onSubmit = (answers: QuizAnswerInput[]) => {
    if (attemptId === null) return

    submit.mutate(
      { attemptId, answers },
      {
        onSuccess: (payload) => {
          setResult(payload.result)
          setSecondsRemaining(undefined)
          void history.refetch()
        },
      },
    )
  }

  if (activeQuiz) {
    return (
      <div className="flex flex-col gap-6">
        {result ? <ResultBanner result={result} isAr={isAr} /> : null}

        <QuizRunner
          quiz={activeQuiz}
          secondsRemaining={secondsRemaining}
          submitting={submit.isPending}
          onSubmit={onSubmit}
          result={result}
        />

        {result ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/90 border border-border justify-between flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setActiveQuiz(null)}>
              {isAr ? '← العودة لسجل الاختبار' : '← Back to quiz summary'}
            </Button>

            {!result.passed && !attemptsExhausted ? (
              <Button
                size="sm"
                icon={<IconRotateClockwise size={15} />}
                onClick={beginAttempt}
                loading={start.isPending}
              >
                {isAr ? 'إعادة المحاولة الآن' : 'Try Again'}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-3xl shadow-lg overflow-hidden flex flex-col">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 border-b border-border bg-gradient-to-r from-primary/5 via-accent/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs shrink-0">
            <IconTrophy size={24} />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg sm:text-xl text-text-main m-0">
              {isAr ? 'اختبار تقييم الدرس' : 'Lesson Quiz Assessment'}
            </h3>
            <p className="text-xs text-text-muted mt-1 mb-0">
              {maxAttempts == null
                ? isAr
                  ? 'يمكنك إجراء هذا الاختبار عدة مرات لتحسين درجتك.'
                  : 'You can take this quiz as many times as you like.'
                : isAr
                  ? `استهلكت ${usedAttempts} من أصل ${maxAttempts} محاولات مسموحة.`
                  : `You have used ${usedAttempts} of ${maxAttempts} allowed attempts.`}
            </p>
          </div>
        </div>

        {bestScore != null ? (
          <Badge tone="success" className="px-3.5 py-1.5 text-xs font-black self-start sm:self-auto">
            <IconTrophy size={14} className="me-1" />
            {isAr ? `أعلى درجة: ${bestScore.toFixed(0)}%` : `Best score: ${bestScore.toFixed(0)}%`}
          </Badge>
        ) : null}
      </div>

      <div className="p-6 sm:p-7 flex flex-col gap-6">
        {/* Attempts History */}
        {(history.data?.attempts.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-text-muted m-0">
              {isAr ? 'سجل المحاولات السابقة' : 'Attempt History'}
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-border bg-surface overflow-hidden">
              <table className="w-full text-start text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-muted/60 text-text-muted text-[11px] uppercase font-bold tracking-wider border-b border-border">
                    <th className="py-3 px-4 text-start">{isAr ? 'المحاولة' : 'Attempt'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'الدرجة' : 'Score'}</th>
                    <th className="py-3 px-4 text-start">{isAr ? 'النتيجة' : 'Status'}</th>
                    <th className="py-3 px-4 text-end">{isAr ? 'تاريخ التسليم' : 'Submitted At'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.data?.attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-text-main">
                        #{attempt.attempt_number}
                      </td>
                      <td className="py-3 px-4 font-black tabular-nums text-text-main">
                        {attempt.score.toFixed(0)}%
                      </td>
                      <td className="py-3 px-4">
                        {attempt.status === 'in_progress' ? (
                          <Badge tone="warning">{isAr ? 'قيد الإجراء' : 'In progress'}</Badge>
                        ) : attempt.passed ? (
                          <Badge tone="success">{isAr ? 'اجتياز ✓' : 'Passed ✓'}</Badge>
                        ) : (
                          <Badge tone="danger">{isAr ? 'لم يجتز' : 'Not passed'}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-text-muted text-end font-mono">
                        {formatDate(attempt.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Start Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border">
          <div>
            {attemptsExhausted ? (
              <p className="text-xs text-danger font-bold m-0">
                {isAr
                  ? 'لقد استهلكت جميع المحاولات المسموحة لهذا الاختبار.'
                  : 'You have used every attempt available for this quiz.'}
              </p>
            ) : (
              <p className="text-xs text-text-subtle m-0">
                {isAr
                  ? 'اضغط على الزر أدناه لبدء حل الأسئلة وتأكيد فهمك لمحتوى الدرس.'
                  : 'Click below to launch the quiz and evaluate your understanding.'}
              </p>
            )}
          </div>

          <Button
            size="md"
            className="shadow-md font-black px-6"
            onClick={beginAttempt}
            loading={start.isPending}
            disabled={attemptsExhausted}
          >
            {usedAttempts > 0
              ? isAr ? 'إعادة الاختبار الآن' : 'Retake the Quiz'
              : isAr ? 'بدء الاختبار الآن' : 'Start the Quiz'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ResultBanner({ result, isAr }: { result: QuizResult; isAr: boolean }) {
  return (
    <div
      className={`p-6 rounded-3xl border flex flex-col gap-3 shadow-lg relative overflow-hidden ${
        result.passed
          ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
          : 'bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-200'
      }`}
      role="status"
    >
      <div className="flex items-center gap-3">
        <span className="shrink-0">
          {result.passed ? (
            <IconCircleCheck size={28} className="text-emerald-600 dark:text-emerald-400" />
          ) : (
            <IconAlertCircle size={28} className="text-rose-600 dark:text-rose-400" />
          )}
        </span>
        <div>
          <h4 className="font-heading font-black text-lg sm:text-xl m-0 leading-tight">
            {result.passed
              ? isAr
                ? `تهانينا! لقد اجتزت الاختبار بنجاح بدرجة ${result.score.toFixed(0)}%`
                : `Congratulations! You passed with ${result.score.toFixed(0)}%`
              : isAr
                ? `حصلت على ${result.score.toFixed(0)}% — اقتربت من الاجتياز!`
                : `You scored ${result.score.toFixed(0)}% — Almost there!`}
          </h4>
          <p className="text-xs mt-1 mb-0 opacity-90">
            {isAr
              ? `الإجابات الصحيحة: ${result.correct_count} من ${result.question_count} · الدرجات المكتسبة: ${result.earned_points}/${result.total_points} · درجة النجاح المطلوبة: ${result.passing_score}%`
              : `${result.correct_count} of ${result.question_count} correct · ${result.earned_points}/${result.total_points} points · pass threshold: ${result.passing_score}%`}
          </p>
        </div>
      </div>
    </div>
  )
}

