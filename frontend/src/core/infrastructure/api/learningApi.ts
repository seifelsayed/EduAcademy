import { z } from 'zod'

import type { LearningRepository } from '@/core/domain/repositories'
import {
  certificateSchema,
  coursePlayerSchema,
  enrollmentSchema,
  lessonProgressSchema,
} from '@/core/domain/schemas/learning'
import { http } from '@/core/infrastructure/http/httpClient'

export const learningApi: LearningRepository = {
  listEnrollments({ status, page }) {
    return http.getPaginated('/my/enrollments', enrollmentSchema, {
      params: { status, page },
    })
  },

  getEnrollment(slug) {
    return http.get(`/courses/${slug}/enrollment`, enrollmentSchema)
  },

  enroll(slug) {
    return http.post(`/courses/${slug}/enroll`, {}, enrollmentSchema)
  },

  getPlayer(slug, lessonSlug) {
    return http.get(`/courses/${slug}/player`, coursePlayerSchema, {
      params: lessonSlug ? { lesson: lessonSlug } : undefined,
    })
  },

  trackProgress(lessonId, input) {
    return http.post(`/lessons/${lessonId}/progress`, input, lessonProgressSchema)
  },

  completeLesson(lessonId, undo = false) {
    return http.post(`/lessons/${lessonId}/complete`, { undo }, enrollmentSchema)
  },

  roster(slug, page) {
    return http.getPaginated(`/courses/${slug}/students`, enrollmentSchema, { params: { page } })
  },

  listCertificates() {
    return http.get('/my/certificates', z.array(certificateSchema))
  },

  claimCertificate(slug) {
    return http.post(`/courses/${slug}/certificate`, {}, certificateSchema)
  },

  verifyCertificate(serial) {
    return http.get(`/certificates/verify/${serial}`, certificateSchema)
  },
}
