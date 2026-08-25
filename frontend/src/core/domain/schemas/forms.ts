import { z } from 'zod'

import { courseLevelSchema, lessonTypeSchema } from './catalog'
import { questionTypeSchema } from './assessment'

/**
 * Input validation. These mirror the backend's rules so the user gets feedback
 * before a round trip; the server remains the authority.
 */

/* ------------------------------------------------------------------- Auth */

export const loginFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean().optional(),
})

/** What the form fields hold before validation (defaults still optional). */
export type LoginFormInput = z.input<typeof loginFormSchema>
/** What the resolver hands to the submit handler. */
export type LoginForm = z.output<typeof loginFormSchema>

export const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Your name is a little short.').max(120),
    email: z.email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[a-zA-Z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    password_confirmation: z.string(),
    role: z.enum(['student', 'instructor']).default('student'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  })

/** What the form fields hold before validation (defaults still optional). */
export type RegisterFormInput = z.input<typeof registerFormSchema>
/** What the resolver hands to the submit handler. */
export type RegisterForm = z.output<typeof registerFormSchema>

export const profileFormSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  headline: z.string().max(180).nullable().optional(),
  bio: z.string().max(5000).nullable().optional(),
  website: z.union([z.url('Enter a valid URL.'), z.literal('')]).nullable().optional(),
})

/** What the form fields hold before validation (defaults still optional). */
export type ProfileFormInput = z.input<typeof profileFormSchema>
/** What the resolver hands to the submit handler. */
export type ProfileForm = z.output<typeof profileFormSchema>

export const passwordFormSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[a-zA-Z]/, 'Include at least one letter.')
      .regex(/\d/, 'Include at least one number.'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'The passwords do not match.',
    path: ['password_confirmation'],
  })

/** What the form fields hold before validation (defaults still optional). */
export type PasswordFormInput = z.input<typeof passwordFormSchema>
/** What the resolver hands to the submit handler. */
export type PasswordForm = z.output<typeof passwordFormSchema>

/* ----------------------------------------------------------------- Course */

export const courseFormSchema = z
  .object({
    title: z.string().min(5, 'Give the course a descriptive title.').max(180),
    subtitle: z.string().max(255).optional(),
    description: z.string().max(20000).optional(),
    category_id: z.coerce.number().int().positive().optional(),
    level: courseLevelSchema.default('all_levels'),
    language: z.string().max(32).default('English'),
    price: z.coerce.number().min(0).max(99999).default(0),
    discount_price: z.union([z.coerce.number().min(0).max(99999), z.literal('')]).optional(),
    promo_video_url: z.union([z.url(), z.literal('')]).optional(),
    requirements: z.array(z.string().max(255)).max(20).default([]),
    outcomes: z.array(z.string().max(255)).max(20).default([]),
    target_audience: z.array(z.string().max(255)).max(20).default([]),
  })
  .refine(
    (data) =>
      data.discount_price === '' ||
      data.discount_price === undefined ||
      data.discount_price <= data.price,
    {
      message: 'The discounted price cannot exceed the regular price.',
      path: ['discount_price'],
    },
  )

/** What the form fields hold before validation (defaults still optional). */
export type CourseFormInput = z.input<typeof courseFormSchema>
/** What the resolver hands to the submit handler. */
export type CourseForm = z.output<typeof courseFormSchema>

export const sectionFormSchema = z.object({
  title: z.string().min(2, 'Give the section a title.').max(180),
  description: z.string().max(2000).optional(),
})

/** What the form fields hold before validation (defaults still optional). */
export type SectionFormInput = z.input<typeof sectionFormSchema>
/** What the resolver hands to the submit handler. */
export type SectionForm = z.output<typeof sectionFormSchema>

export const lessonFormSchema = z
  .object({
    title: z.string().min(2, 'Give the lesson a title.').max(180),
    type: lessonTypeSchema.default('video'),
    content: z.string().max(100000).optional(),
    video_url: z.union([z.url('Enter a valid video URL.'), z.literal('')]).optional(),
    video_duration_seconds: z.coerce.number().int().min(0).max(86400).optional(),
    duration_minutes: z.coerce.number().int().min(0).max(1440).default(0),
    is_preview: z.boolean().default(false),
    is_published: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if ((data.type === 'video' || data.type === 'resource') && !data.video_url) {
      ctx.addIssue({
        code: 'custom',
        message: 'A video or resource lesson needs a URL.',
        path: ['video_url'],
      })
    }

    if (data.type === 'article' && !data.content?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'An article lesson needs content.',
        path: ['content'],
      })
    }
  })

/** What the form fields hold before validation (defaults still optional). */
export type LessonFormInput = z.input<typeof lessonFormSchema>
/** What the resolver hands to the submit handler. */
export type LessonForm = z.output<typeof lessonFormSchema>

/* ------------------------------------------------------------- Assessment */

export const quizFormSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().max(2000).optional(),
  time_limit_minutes: z.union([z.coerce.number().int().min(1).max(480), z.literal('')]).optional(),
  passing_score: z.coerce.number().int().min(0).max(100).default(60),
  max_attempts: z.union([z.coerce.number().int().min(1).max(100), z.literal('')]).optional(),
  shuffle_questions: z.boolean().default(false),
  show_correct_answers: z.boolean().default(true),
})

/** What the form fields hold before validation (defaults still optional). */
export type QuizFormInput = z.input<typeof quizFormSchema>
/** What the resolver hands to the submit handler. */
export type QuizForm = z.output<typeof quizFormSchema>

export const questionFormSchema = z
  .object({
    type: questionTypeSchema.default('single_choice'),
    prompt: z.string().min(2, 'Write the question.').max(2000),
    explanation: z.string().max(2000).optional(),
    points: z.coerce.number().int().min(1).max(100).default(1),
    answer_key: z.string().max(500).optional(),
    options: z
      .array(z.object({ text: z.string().min(1, 'Options cannot be empty.').max(500), is_correct: z.boolean() }))
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'short_answer') {
      if (!data.answer_key?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Provide the accepted answer(s), separated by "|".',
          path: ['answer_key'],
        })
      }
      return
    }

    if (data.options.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'Add at least two options.', path: ['options'] })
      return
    }

    const correct = data.options.filter((option) => option.is_correct)

    if (correct.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Mark one option as correct.', path: ['options'] })
    }

    if (data.type !== 'multiple_choice' && correct.length > 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'This question type allows only one correct option.',
        path: ['options'],
      })
    }

    if (data.type === 'true_false' && data.options.length !== 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'A true/false question needs exactly two options.',
        path: ['options'],
      })
    }
  })

/** What the form fields hold before validation (defaults still optional). */
export type QuestionFormInput = z.input<typeof questionFormSchema>
/** What the resolver hands to the submit handler. */
export type QuestionForm = z.output<typeof questionFormSchema>

export const assignmentFormSchema = z.object({
  title: z.string().min(2).max(180),
  instructions: z.string().max(20000).optional(),
  max_points: z.coerce.number().int().min(1).max(1000).default(100),
  due_at: z.string().optional(),
  allow_late_submissions: z.boolean().default(true),
})

/** What the form fields hold before validation (defaults still optional). */
export type AssignmentFormInput = z.input<typeof assignmentFormSchema>
/** What the resolver hands to the submit handler. */
export type AssignmentForm = z.output<typeof assignmentFormSchema>

export const submissionFormSchema = z.object({
  content: z.string().min(1, 'Write your answer.').max(50000),
})

/** What the form fields hold before validation (defaults still optional). */
export type SubmissionFormInput = z.input<typeof submissionFormSchema>
/** What the resolver hands to the submit handler. */
export type SubmissionForm = z.output<typeof submissionFormSchema>

export const gradeFormSchema = z.object({
  score: z.coerce.number().int().min(0),
  feedback: z.string().max(5000).optional(),
})

/** What the form fields hold before validation (defaults still optional). */
export type GradeFormInput = z.input<typeof gradeFormSchema>
/** What the resolver hands to the submit handler. */
export type GradeForm = z.output<typeof gradeFormSchema>

/* ------------------------------------------------------------- Engagement */

export const reviewFormSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Pick a rating.').max(5),
  title: z.string().max(180).optional(),
  comment: z.string().max(5000).optional(),
})

/** What the form fields hold before validation (defaults still optional). */
export type ReviewFormInput = z.input<typeof reviewFormSchema>
/** What the resolver hands to the submit handler. */
export type ReviewForm = z.output<typeof reviewFormSchema>

export const categoryFormSchema = z.object({
  name: z.string().min(2).max(120),
  parent_id: z.union([z.coerce.number().int().positive(), z.literal('')]).optional(),
  description: z.string().max(1000).optional(),
  icon: z.string().max(64).optional(),
  color: z.string().max(32).optional(),
  position: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
})

/** What the form fields hold before validation (defaults still optional). */
export type CategoryFormInput = z.input<typeof categoryFormSchema>
/** What the resolver hands to the submit handler. */
export type CategoryForm = z.output<typeof categoryFormSchema>
