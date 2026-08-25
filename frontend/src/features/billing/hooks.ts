import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import type { OrderStatus } from '@/core/domain/schemas/engagement'
import { billingApi } from '@/core/infrastructure/api/billingApi'
import { queryKeys } from '@/shared/lib/queryKeys'
import { toast } from '@/stores/toastStore'

export function useCheckoutQuote(slug: string | undefined) {
  return useQuery({
    queryKey: queryKeys.billing.quote(slug ?? ''),
    queryFn: () => billingApi.quote(slug as string),
    enabled: Boolean(slug),
  })
}

export function useMyOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.billing.orders(page),
    queryFn: () => billingApi.listOrders(page),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(reference: string | undefined) {
  return useQuery({
    queryKey: queryKeys.billing.order(reference ?? ''),
    queryFn: () => billingApi.getOrder(reference as string),
    enabled: Boolean(reference),
  })
}

export function useCreateOrder() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ slug, paymentMethod }: { slug: string; paymentMethod?: string }) =>
      billingApi.createOrder(slug, paymentMethod),
    onSuccess: (order) => navigate(`/checkout/${order.reference}`),
    onError: (error) => toast.fromError(error, 'Could not start checkout.'),
  })
}

export function useConfirmOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ reference, paymentReference }: { reference: string; paymentReference?: string }) =>
      billingApi.confirmOrder(reference, paymentReference),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learning.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })

      toast.success('Payment confirmed.', 'You are enrolled — enjoy the course.')

      if (result.enrollment.course) {
        navigate(`/learn/${result.enrollment.course.slug}`)
      }
    },
    onError: (error) => toast.fromError(error, 'Payment could not be confirmed.'),
  })
}

export function useAdminOrders(status: OrderStatus | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.billing.adminOrders(status, page),
    queryFn: () => billingApi.adminListOrders({ status, page }),
    placeholderData: keepPreviousData,
  })
}

export function useRefundOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reference: string) => billingApi.refundOrder(reference),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billing'] })
      toast.success('Order refunded.')
    },
    onError: (error) => toast.fromError(error),
  })
}
