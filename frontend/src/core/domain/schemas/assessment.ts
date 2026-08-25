import { z } from 'zod'

import { timestamp } from './common'
import { userSchema } from './user'

/* ----------------------------------------------------------------- Quizzes */

export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'true_false',
  'short_answer',
])

export type QuestionType = z.infer<typeof questionTypeSchema>

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Single choice',
  multiple_choice: 'Multiple choice',
  true_false: 'True / false',
  short_answer: 'Short answer',
}

/** Question types graded by comparing selected option ids. */
export function isOptionBased(type: QuestionType): boolean {
  return type !== 'short_answer'
}

export const questionOptionSchema = z.object({
  id: z.number().int(),
  text: z.string(),
  position: z.number().int(),
  // Present only when the viewer may see the answer key.
  is_correct: z.boolean().optional(),
})

export type QuestionOption = z.infer<typeof questionOptionSchema>

export const questionSchema = z.object({
  id: z.number().int(),
  quiz_id: z.number().int(),
  type: questionTypeSchema,
  prompt: z.string(),
  points: z.number().int(),
  position: z.number().int(),
  explanation: z.string().nullable().optional(),
  answer_key: z.string().nullable().optional(),
  options: z.array(questionOptionSchema).optional(),
})

export type Question = z.infer<typeof questionSchema>

export const quizSchema = z.object({
  id: z.number().int(),
  lesson_id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  time_limit_minutes: z.number().int().nullable(),
  passing_score: z.number().int(),
  max_attempts: z.number().int().nullable(),
  shuffle_questions: z.boolean(),
  show_correct_answers: z.boolean(),
  questions_count: z.number().int().optional(),
  total_points: z.number().int().optional(),
  questions: z.array(questionSchema).optional(),
  used_attempts: z.number().int().optional(),
  best_score: z.number().optional(),
})

export type Quiz = z.infer<typeof quizSchema>

export const attemptStatusSchema = z.enum(['in_progress', 'submitted', 'abandoned'])
export type AttemptStatus = z.infer<typeof attemptStatusSchema>

export const quizAttemptSchema = z.object({
  id: z.number().int(),
  quiz_id: z.number().int(),
  status: attemptStatusSchema,
  attempt_number: z.number().int(),
  score: z.number(),
  earned_points: z.number().int(),
  total_points: z.number().int(),
  correct_count: z.number().int(),
  question_count: z.number().int(),
  passed: z.boolean(),
  started_at: timestamp,
  expires_at: timestamp,
  submitted_at: timestamp,
  seconds_remaining: z.number().int().optional(),
  answers: z
    .array(
      z.object({
        question_id: z.number().int(),
        selected_option_ids: z.array(z.number().int()).default([]),
        text_answer: z.string().nullable(),
        is_correct: z.boolean(),
        earned_points: z.number().int(),
      }),
    )
    .optional(),
  quiz: quizSchema.nullish(),
})

export type QuizAttempt = z.infer<typeof quizAttemptSchema>

export const quizStartSchema = z.object({
  attempt: quizAttemptSchema,
  quiz: quizSchema,
})

export type QuizStart = z.infer<typeof quizStartSchema>

export const quizResultSchema = z.object({
  score: z.number(),
  earned_points: z.number().int(),
  total_points: z.number().int(),
  correct_count: z.number().int(),
  question_count: z.number().int(),
  passed: z.boolean(),
  passing_score: z.number().int(),
  show_correct_answers: z.boolean(),
  breakdown: z.array(
    z.object({
      question_id: z.number().int(),
      is_correct: z.boolean(),
      earned_points: z.number().int(),
      points: z.number().int(),
    }),
  ),
})

export type QuizResult = z.infer<typeof quizResultSchema>

export const quizSubmissionSchema = z.object({
  attempt: quizAttemptSchema,
  result: quizResultSchema,
})

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>

/* ------------------------------------------------------------- Assignments */

export const submissionStatusSchema = z.enum([
  'draft',
  'submitted',
  'graded',
  'returned_for_revision',
])

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: 'Draft',
  submitted: 'Awaiting grade',
  graded: 'Graded',
  returned_for_revision: 'Needs revision',
}

export const submissionSchema = z.object({
  id: z.number().int(),
  assignment_id: z.number().int(),
  content: z.string().nullable(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
  status: submissionStatusSchema,
  score: z.number().int().nullable(),
  feedback: z.string().nullable(),
  is_late: z.boolean(),
  submitted_at: timestamp,
  graded_at: timestamp,
  student: userSchema.nullish(),
  grader: userSchema.nullish(),
  assignment: z.unknown().optional(),
})

export type Submission = z.infer<typeof submissionSchema>

export const assignmentSchema = z.object({
  id: z.number().int(),
  lesson_id: z.number().int(),
  title: z.string(),
  instructions: z.string().nullable(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).default([]),
  max_points: z.number().int(),
  due_at: timestamp,
  allow_late_submissions: z.boolean(),
  is_overdue: z.boolean(),
  accepts_submissions: z.boolean(),
  submissions_count: z.number().int().optional(),
  my_submission: submissionSchema.nullable().optional(),
})

export type Assignment = z.infer<typeof assignmentSchema>
