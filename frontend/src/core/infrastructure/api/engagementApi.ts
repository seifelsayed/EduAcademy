import { z } from 'zod'

import type { EngagementRepository } from '@/core/domain/repositories'
import { courseSchema } from '@/core/domain/schemas/catalog'
import { reviewSchema, wishlistToggleSchema } from '@/core/domain/schemas/engagement'
import { http } from '@/core/infrastructure/http/httpClient'

export const engagementApi: EngagementRepository = {
  listReviews(slug, params) {
    return http.getPaginated(`/courses/${slug}/reviews`, reviewSchema, { params })
  },

  submitReview(slug, input) {
    return http.post(`/courses/${slug}/reviews`, input, reviewSchema)
  },

  deleteReview(id) {
    return http.command('delete', `/reviews/${id}`)
  },

  replyToReview(id, body) {
    return http.post(`/reviews/${id}/reply`, { body }, reviewSchema)
  },

  listWishlist() {
    return http.get('/my/wishlist', z.array(courseSchema))
  },

  toggleWishlist(slug) {
    return http.post(`/courses/${slug}/wishlist`, {}, wishlistToggleSchema)
  },
}
