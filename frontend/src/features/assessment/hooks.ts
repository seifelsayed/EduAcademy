import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { SubmissionStatus } from '@/core/domain/schemas/assessment'
import type {
  AssignmentForm,
  GradeForm,
  QuestionForm,
  QuizForm,
  SubmissionForm,
} from '@/core/domain/schemas/forms'
import { assessmentApi } from '@/core/infrastructure/api/assessmentApi'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

/* ---------------------------------------------------------- Quiz authoring */

export function useQuiz(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.assessment.quiz(id ?? 0),
    queryFn: () => assessmentApi.getQuiz(id as number),
    enabled: Boolean(id),
  })
}

export function useQuizMutations(lessonId: number, quizId?: number) {
  const queryClient = useQueryClient()

  const refresh = async () => {
    if (quizId) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessment.quiz(quizId) })
    }
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
  }

  const saveQuiz = useMutation({
    mutationFn: (input: QuizForm) => assessmentApi.saveQuiz(lessonId, normaliseQuiz(input)),
    onSuccess: async () => {
      await refresh()
      toast.success('Quiz saved.')
    },
    onError: (error) => toast.fromError(error),
  })

  const addQuestion = useMutation({
    mutationFn: ({ quiz, input }: { quiz: number; input: QuestionForm }) =>
      assessmentApi.addQuestion(quiz, input as Record<string, unknown>),
    onSuccess: async () => {
      await refresh()
      toast.success('Question added.')
    },
    onError: (error) => toast.fromError(error),
  })

  const updateQuestion = useMutation({
    mutationFn: ({ id, input }: { id: number; input: QuestionForm }) =>
      assessmentApi.updateQuestion(id, input as Record<string, unknown>),
    onSuccess: async () => {
      await refresh()
      toast.success('Question updated.')
    },
    onError: (error) => toast.fromError(error),
  })

  const deleteQuestion = useMutation({
    mutationFn: (id: number) => assessmentApi.deleteQuestion(id),
    onSuccess: async () => {
      await refresh()
      toast.success('Question removed.')
    },
    onError: (error) => toast.fromError(error),
  })

  return { saveQuiz, addQuestion, updateQuestion, deleteQuestion }
}

/**
 * Empty strings from optional numeric inputs must become nulls, not zeroes —
 * "no time limit" and "0 minutes" mean very different things.
 */
function normaliseQuiz(input: QuizForm): Record<string, unknown> {
  return {
    ...input,
    time_limit_minutes: input.time_limit_minutes === '' ? null : input.time_limit_minutes,
    max_attempts: input.max_attempts === '' ? null : input.max_attempts,
  }
}

/* ------------------------------------------------------------ Taking a quiz */

export function useStartAttempt() {
  return useMutation({
    mutationFn: (quizId: number) => assessmentApi.startAttempt(quizId),
    onError: (error) => toast.fromError(error, 'Could not start the quiz.'),
  })
}

export function useSubmitAttempt(courseSlug?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: number
      answers: { question_id: number; option_ids?: number[]; text?: string | null }[]
    }) => assessmentApi.submitAttempt(attemptId, answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessment.all })

      if (courseSlug) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.learning.player(courseSlug) })
      }
    },
    onError: (error) => toast.fromError(error, 'Could not submit your answers.'),
  })
}

export function useAttemptHistory(quizId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.assessment.attempts(quizId ?? 0),
    queryFn: () => assessmentApi.attemptHistory(quizId as number),
    enabled: Boolean(quizId),
  })
}

/* -------------------------------------------------------------- Assignments */

export function useAssignment(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.assessment.assignment(id ?? 0),
    queryFn: () => assessmentApi.getAssignment(id as number),
    enabled: Boolean(id),
  })
}

export function useSaveAssignment(lessonId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AssignmentForm) =>
      assessmentApi.saveAssignment(lessonId, {
        ...input,
        due_at: input.due_at || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessment.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      toast.success('Assignment saved.')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useSubmitAssignment(assignmentId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, asDraft }: { input: SubmissionForm; asDraft?: boolean }) =>
      assessmentApi.submitAssignment(assignmentId, { ...input, as_draft: asDraft }),
    onSuccess: async (_submission, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.assessment.assignment(assignmentId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.learning.all })

      toast.success(variables.asDraft ? 'Draft saved.' : 'Assignment submitted.')
    },
    onError: (error) => toast.fromError(error, 'Could not submit your work.'),
  })
}

export function useAssignmentSubmissions(
  assignmentId: number | undefined,
  status: SubmissionStatus | undefined,
  page = 1,
) {
  return useQuery({
    queryKey: queryKeys.assessment.submissions(assignmentId ?? 0, page),
    queryFn: () => assessmentApi.listSubmissions(assignmentId as number, { status, page }),
    enabled: Boolean(assignmentId),
    placeholderData: keepPreviousData,
  })
}

export function usePendingSubmissions(page = 1) {
  return useQuery({
    queryKey: queryKeys.assessment.pending(page),
    queryFn: () => assessmentApi.pendingSubmissions(page),
    placeholderData: keepPreviousData,
  })
}

export function useGradeSubmission() {
  const queryClient = useQueryClient()

  const grade = useMutation({
    mutationFn: ({ id, input }: { id: number; input: GradeForm }) =>
      assessmentApi.gradeSubmission(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessment.all })
      toast.success('Graded.')
    },
    onError: (error) => toast.fromError(error, 'Could not save the grade.'),
  })

  const returnForRevision = useMutation({
    mutationFn: ({ id, feedback }: { id: number; feedback: string }) =>
      assessmentApi.returnSubmission(id, feedback),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessment.all })
      toast.info('Sent back for revision.')
    },
    onError: (error) => toast.fromError(error),
  })

  return { grade, returnForRevision }
}
