import { z } from 'zod'

import { courseSchema } from './catalog'
import { timestamp } from './common'
import { userSchema } from './user'

/* ---------------------------------------------------------------- Reviews */

export const reviewSchema = z.object({
  id: z.number().int(),
  course_id: z.number().int(),
  rating: z.number().int(),
  title: z.string().nullable(),
  comment: z.string().nullable(),
  instructor_reply: z.string().nullable(),
  replied_at: timestamp,
  created_at: timestamp,
  is_mine: z.boolean(),
  author: userSchema.nullish(),
  course: courseSchema.nullish(),
})

export type Review = z.infer<typeof reviewSchema>

/** Counts keyed by star value, "5" through "1". */
export const ratingBreakdownSchema = z.record(z.string(), z.number().int())
export type RatingBreakdown = z.infer<typeof ratingBreakdownSchema>

/* ----------------------------------------------------------------- Orders */

export const orderStatusSchema = z.enum(['pending', 'paid', 'failed', 'refunded'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const orderSchema = z.object({
  id: z.number().int(),
  reference: z.string(),
  status: orderStatusSchema,
  amount_cents: z.number().int(),
  discount_cents: z.number().int(),
  total_cents: z.number().int(),
  currency: z.string(),
  payment_method: z.string().nullable(),
  paid_at: timestamp,
  refunded_at: timestamp,
  created_at: timestamp,
  platform_fee_cents: z.number().int().optional(),
  instructor_payout_cents: z.number().int().optional(),
  course: courseSchema.nullish(),
  buyer: userSchema.nullish(),
})

export type Order = z.infer<typeof orderSchema>

export const checkoutQuoteSchema = z.object({
  list_price_cents: z.number().int(),
  total_cents: z.number().int(),
  discount_percent: z.number().int(),
  currency: z.string(),
})

export type CheckoutQuote = z.infer<typeof checkoutQuoteSchema>

export const wishlistToggleSchema = z.object({
  wishlisted: z.boolean(),
})
