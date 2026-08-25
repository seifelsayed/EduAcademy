import { z } from 'zod'

/**
 * Every API response arrives in the same envelope, so the parsing helpers live
 * here once rather than in each repository.
 *
 * Success: { data, message?, meta? }
 * Failure: { message, error: { code, ... }, errors? }
 */

export const paginationMetaSchema = z.object({
  current_page: z.number().int(),
  last_page: z.number().int(),
  per_page: z.number().int(),
  total: z.number().int(),
  from: z.number().int().nullable(),
  to: z.number().int().nullable(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

export const apiErrorBodySchema = z.object({
  message: z.string(),
  error: z.looseObject({ code: z.string() }).optional(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
})

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

/** Wraps an item schema in the success envelope. */
export function envelope<T extends z.ZodType>(item: T) {
  return z.object({
    data: item,
    message: z.string().optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
}

/** Wraps an item schema in the paginated envelope. */
export function paginatedEnvelope<T extends z.ZodType>(item: T) {
  return z.object({
    data: z.array(item),
    meta: paginationMetaSchema.and(z.record(z.string(), z.unknown())),
  })
}

export interface Paginated<T> {
  items: T[]
  meta: PaginationMeta
  /** Extra keys the endpoint added to `meta` (totals, breakdowns, and so on). */
  extra: Record<string, unknown>
}

/** ISO-8601 timestamp, or null when the backend has no value for it. */
export const timestamp = z.string().nullable()

export const moneySchema = z.object({
  amount_cents: z.number().int(),
  discount_cents: z.number().int().nullable(),
  effective_cents: z.number().int(),
  currency: z.string(),
  is_free: z.boolean(),
  discount_percent: z.number().int(),
})

export type Money = z.infer<typeof moneySchema>
