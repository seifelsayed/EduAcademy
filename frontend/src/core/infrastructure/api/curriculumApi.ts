import { z } from 'zod'

import type { CurriculumRepository } from '@/core/domain/repositories'
import { lessonSchema, sectionSchema } from '@/core/domain/schemas/catalog'
import { http } from '@/core/infrastructure/http/httpClient'

export const curriculumApi: CurriculumRepository = {
  listSections(slug) {
    return http.get(`/courses/${slug}/sections`, z.array(sectionSchema))
  },

  createSection(slug, input) {
    return http.post(`/courses/${slug}/sections`, input, sectionSchema)
  },

  updateSection(id, input) {
    return http.patch(`/sections/${id}`, input, sectionSchema)
  },

  deleteSection(id) {
    return http.command('delete', `/sections/${id}`)
  },

  reorderSections(slug, ids) {
    return http.post(`/courses/${slug}/sections/reorder`, { ids }, z.array(sectionSchema))
  },

  getLesson(id) {
    return http.get(`/lessons/${id}`, lessonSchema)
  },

  createLesson(sectionId, input) {
    return http.post(`/sections/${sectionId}/lessons`, input, lessonSchema)
  },

  updateLesson(id, input) {
    return http.patch(`/lessons/${id}`, input, lessonSchema)
  },

  deleteLesson(id) {
    return http.command('delete', `/lessons/${id}`)
  },

  reorderLessons(sectionId, ids) {
    return http.post(`/sections/${sectionId}/lessons/reorder`, { ids }, z.array(lessonSchema))
  },
}
