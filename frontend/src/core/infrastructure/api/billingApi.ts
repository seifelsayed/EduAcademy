import { z } from 'zod'

import type { BillingRepository } from '@/core/domain/repositories'
import { checkoutQuoteSchema, orderSchema } from '@/core/domain/schemas/engagement'
import { enrollmentSchema } from '@/core/domain/schemas/learning'
import { http } from '@/core/infrastructure/http/httpClient'

export const billingApi: BillingRepository = {
  quote(slug) {
    return http.get(`/courses/${slug}/quote`, checkoutQuoteSchema)
  },

  createOrder(slug, paymentMethod) {
    return http.post(`/courses/${slug}/orders`, { payment_method: paymentMethod }, orderSchema)
  },

  getOrder(reference) {
    return http.get(`/orders/${reference}`, orderSchema)
  },

  confirmOrder(reference, paymentReference) {
    return http.post(
      `/orders/${reference}/confirm`,
      { payment_reference: paymentReference },
      z.object({ order: orderSchema, enrollment: enrollmentSchema }),
    )
  },

  listOrders(page) {
    return http.getPaginated('/my/orders', orderSchema, { params: { page } })
  },

  adminListOrders(params) {
    return http.getPaginated('/admin/orders', orderSchema, { params })
  },

  refundOrder(reference) {
    return http.post(`/admin/orders/${reference}/refund`, {}, orderSchema)
  },
}
