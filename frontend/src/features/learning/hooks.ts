import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { isApiError } from '@/core/domain/errors/ApiError'
import type { EnrollmentStatus } from '@/core/domain/schemas/learning'
import { learningApi } from '@/core/infrastructure/api/learningApi'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

export function useMyEnrollments(status: EnrollmentStatus | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.learning.enrollments(status, page),
    queryFn: () => learningApi.listEnrollments({ status, page }),
    placeholderData: keepPreviousData,
  })
}

export function useCoursePlayer(slug: string | undefined, lessonSlug?: string) {
  return useQuery({
    queryKey: queryKeys.learning.player(slug ?? '', lessonSlug),
    queryFn: () => learningApi.getPlayer(slug as string, lessonSlug),
    enabled: Boolean(slug),
    // The player is the learner's live workspace — always show fresh progress.
    staleTime: 0,
  })
}

export function useEnroll() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (slug: string) => learningApi.enroll(slug),
    onSuccess: async (enrollment) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.learning.all })

      toast.success('You are enrolled.', 'Jump in whenever you are ready.')

      if (enrollment.course) {
        navigate(`/learn/${enrollment.course.slug}`)
      }
    },
    onError: (error) => {
      // A paid course is not an error the learner should see as a failure —
      // send them to checkout instead.
      if (isApiError(error) && error.requiresPayment) {
        toast.info('This course needs to be purchased first.')
        return
      }

      toast.fromError(error, 'Could not enrol you in this course.')
    },
  })
}

/**
 * Fire-and-forget playback heartbeat. Deliberately silent: a dropped beat is
 * recovered by the next one, and a toast every 15 seconds would be unusable.
 */
export function useTrackProgress() {
  return useMutation({
    mutationFn: ({
      lessonId,
      watchedSeconds,
      positionSeconds,
    }: {
      lessonId: number
      watchedSeconds: number
      positionSeconds: number
    }) =>
      learningApi.trackProgress(lessonId, {
        watched_seconds: watchedSeconds,
        position_seconds: positionSeconds,
      }),
  })
}

export function useCompleteLesson(courseSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, undo }: { lessonId: number; undo?: boolean }) =>
      learningApi.completeLesson(lessonId, undo),
    onSuccess: async (_enrollment, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.learning.player(courseSlug),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.learning.all })

      if (!variables.undo) {
        toast.success('Lesson complete.')
      }
    },
    onError: (error) => toast.fromError(error),
  })
}

export function useCourseRoster(slug: string | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.courses.roster(slug ?? '', page),
    queryFn: () => learningApi.roster(slug as string, page),
    enabled: Boolean(slug),
    placeholderData: keepPreviousData,
  })
}

export function useCertificates() {
  return useQuery({
    queryKey: queryKeys.learning.certificates,
    queryFn: () => learningApi.listCertificates(),
  })
}

export function useClaimCertificate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slug: string) => learningApi.claimCertificate(slug),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learning.certificates })
      toast.success('Certificate issued.', 'Congratulations on finishing the course.')
    },
    onError: (error) => toast.fromError(error, 'This certificate is not available yet.'),
  })
}

export function useVerifyCertificate(serial: string | undefined) {
  return useQuery({
    queryKey: queryKeys.learning.certificate(serial ?? ''),
    queryFn: () => learningApi.verifyCertificate(serial as string),
    enabled: Boolean(serial),
    retry: false,
  })
}
