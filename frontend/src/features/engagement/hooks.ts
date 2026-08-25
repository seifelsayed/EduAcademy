import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ReviewForm } from '@/core/domain/schemas/forms'
import { engagementApi } from '@/core/infrastructure/api/engagementApi'
import { queryKeys } from '@/shared/lib/queryKeys'
import { useIsAuthenticated } from '@/stores/authStore'
import { toast } from '@/stores/toastStore'

export function useReviews(slug: string | undefined, rating: number | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.engagement.reviews(slug ?? '', rating, page),
    queryFn: () => engagementApi.listReviews(slug as string, { rating, page }),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
  })
}

export function useSubmitReview(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReviewForm) => engagementApi.submitReview(slug, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['engagement', 'reviews', slug] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(slug) })
      toast.success('Thanks for your review.')
    },
    onError: (error) => toast.fromError(error, 'Could not post your review.'),
  })
}

export function useDeleteReview(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => engagementApi.deleteReview(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['engagement', 'reviews', slug] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(slug) })
      toast.success('Review removed.')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useReplyToReview(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => engagementApi.replyToReview(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['engagement', 'reviews', slug] })
      toast.success('Reply posted.')
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useWishlist() {
  const isAuthenticated = useIsAuthenticated()

  return useQuery({
    queryKey: queryKeys.engagement.wishlist,
    queryFn: () => engagementApi.listWishlist(),
    enabled: isAuthenticated,
  })
}

export function useToggleWishlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => engagementApi.toggleWishlist(slug),
    onSuccess: async (result, slug) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.engagement.wishlist })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(slug) })

      toast.success(result.wishlisted ? 'Saved to your wishlist.' : 'Removed from your wishlist.')
    },
    onError: (error) => toast.fromError(error, 'Sign in to use your wishlist.'),
  })
}
