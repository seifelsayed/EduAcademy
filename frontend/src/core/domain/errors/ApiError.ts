/**
 * A failure from the API, normalised so every layer above can rely on the same
 * shape regardless of whether the cause was HTTP, network, or schema drift.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string[]>
  readonly context: Record<string, unknown>

  constructor(params: {
    message: string
    status?: number
    code?: string
    fieldErrors?: Record<string, string[]>
    context?: Record<string, unknown>
  }) {
    super(params.message)
    this.name = 'ApiError'
    this.status = params.status ?? 0
    this.code = params.code ?? 'error'
    this.fieldErrors = params.fieldErrors ?? {}
    this.context = params.context ?? {}
  }

  /** No response at all — offline, DNS failure, or a blocked request. */
  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isUnauthenticated(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isValidationError(): boolean {
    return this.status === 422 || Object.keys(this.fieldErrors).length > 0
  }

  get requiresPayment(): boolean {
    return this.status === 402
  }

  /** Server-side faults are worth retrying; client mistakes are not. */
  get isRetryable(): boolean {
    return this.isNetworkError || this.status >= 500 || this.status === 429
  }

  /** First message for a field, for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0]
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Turns any thrown value into something safe to show a user. */
export function toUserMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isApiError(error)) {
    return error.isNetworkError ? 'Cannot reach the server. Check your connection.' : error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
