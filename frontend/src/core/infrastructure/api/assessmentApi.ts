import { z } from 'zod'

import type { AssessmentRepository } from '@/core/domain/repositories'
import {
  assignmentSchema,
  questionSchema,
  quizAttemptSchema,
  quizSchema,
  quizStartSchema,
  quizSubmissionSchema,
  submissionSchema,
} from '@/core/domain/schemas/assessment'
import { http } from '@/core/infrastructure/http/httpClient'

export const assessmentApi: AssessmentRepository = {
  getQuiz(id) {
    return http.get(`/quizzes/${id}`, quizSchema)
  },

  saveQuiz(lessonId, input) {
    return http.put(`/lessons/${lessonId}/quiz`, input, quizSchema)
  },

  deleteQuiz(id) {
    return http.command('delete', `/quizzes/${id}`)
  },

  addQuestion(quizId, input) {
    return http.post(`/quizzes/${quizId}/questions`, input, questionSchema)
  },

  updateQuestion(id, input) {
    return http.patch(`/questions/${id}`, input, questionSchema)
  },

  deleteQuestion(id) {
    return http.command('delete', `/questions/${id}`)
  },

  startAttempt(quizId) {
    return http.post(`/quizzes/${quizId}/attempts`, {}, quizStartSchema)
  },

  submitAttempt(attemptId, answers) {
    return http.post(`/attempts/${attemptId}/submit`, { answers }, quizSubmissionSchema)
  },

  getAttempt(id) {
    return http.get(`/attempts/${id}`, quizAttemptSchema)
  },

  async attemptHistory(quizId) {
    // Attempt allowances travel in `meta`, so read the envelope directly.
    const response = await http.raw.get(`/quizzes/${quizId}/attempts`)

    const parsed = z
      .object({
        data: z.array(quizAttemptSchema),
        meta: z.record(z.string(), z.unknown()).default({}),
      })
      .parse(response.data)

    return { attempts: parsed.data, extra: parsed.meta }
  },

  getAssignment(id) {
    return http.get(`/assignments/${id}`, assignmentSchema)
  },

  saveAssignment(lessonId, input) {
    return http.put(`/lessons/${lessonId}/assignment`, input, assignmentSchema)
  },

  deleteAssignment(id) {
    return http.command('delete', `/assignments/${id}`)
  },

  submitAssignment(assignmentId, input) {
    return http.post(`/assignments/${assignmentId}/submissions`, input, submissionSchema)
  },

  getSubmission(id) {
    return http.get(`/submissions/${id}`, submissionSchema)
  },

  listSubmissions(assignmentId, params) {
    return http.getPaginated(`/assignments/${assignmentId}/submissions`, submissionSchema, { params })
  },

  pendingSubmissions(page) {
    return http.getPaginated('/instructor/submissions/pending', submissionSchema, {
      params: { page },
    })
  },

  gradeSubmission(id, input) {
    return http.post(`/submissions/${id}/grade`, input, submissionSchema)
  },

  returnSubmission(id, feedback) {
    return http.post(`/submissions/${id}/return`, { feedback }, submissionSchema)
  },
}
