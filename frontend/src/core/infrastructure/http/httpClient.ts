import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import type { z } from 'zod'

import { ApiError } from '@/core/domain/errors/ApiError'
import {
  apiErrorBodySchema,
  envelope,
  paginatedEnvelope,
  type Paginated,
  type PaginationMeta,
} from '@/core/domain/schemas/common'
import { tokenStorage } from '@/core/infrastructure/storage/tokenStorage'
import { env } from '@/shared/config/env'

/**
 * The single seam between the app and the network.
 *
 * Responsibilities, in order:
 *  1. attach the bearer token,
 *  2. normalise every failure into an ApiError,
 *  3. validate every success against a Zod schema before it reaches the app.
 *
 * Step 3 means a backend contract change surfaces as one loud, located error
 * instead of an `undefined is not an object` three components deep.
 */

const instance: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
  // Axios only mirrors the XSRF-TOKEN cookie into the X-XSRF-TOKEN header when
  // this is on. Without it Sanctum's stateful guard rejects every write with a
  // 419, which silently breaks login.
  withXSRFToken: true,
  timeout: 30_000,
})

/**
 * Sanctum treats requests from the SPA's origin as stateful, so a write needs
 * the XSRF-TOKEN cookie to exist first. This fetches it once and remembers the
 * in-flight promise, so a burst of parallel writes triggers a single round trip.
 */
const apiOrigin = env.apiUrl.startsWith('http') ? new URL(env.apiUrl).origin : ''
let csrfRequest: Promise<void> | null = null

async function ensureCsrfCookie(): Promise<void> {
  if (document.cookie.includes('XSRF-TOKEN=')) return

  csrfRequest ??= axios
    .get(`${apiOrigin}/sanctum/csrf-cookie`, { withCredentials: true })
    .then(() => undefined)
    .catch(() => undefined)
    .finally(() => {
      csrfRequest = null
    })

  await csrfRequest
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete'])

instance.interceptors.request.use(async (config) => {
  const token = tokenStorage.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (MUTATING_METHODS.has((config.method ?? 'get').toLowerCase())) {
    await ensureCsrfCookie()
  }

  return config
})

/** Called when the API reports the session is gone, so the app can reset. */
let onUnauthenticated: (() => void) | null = null

export function setUnauthenticatedHandler(handler: () => void): void {
  onUnauthenticated = handler
}

instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normaliseError(error)),
)

function normaliseError(error: unknown): ApiError {
  if (!(error instanceof AxiosError)) {
    return new ApiError({
      message: error instanceof Error ? error.message : 'Unexpected error.',
    })
  }

  if (!error.response) {
    return new ApiError({
      message: error.code === 'ECONNABORTED' ? 'The request timed out.' : 'Network error.',
      status: 0,
      code: error.code ?? 'network_error',
    })
  }

  const { status, data } = error.response
  const parsed = apiErrorBodySchema.safeParse(data)

  if (status === 401) {
    tokenStorage.clear()
    onUnauthenticated?.()
  }

  if (!parsed.success) {
    return new ApiError({
      message: `Request failed with status ${status}.`,
      status,
      code: 'unexpected_response',
    })
  }

  const { message, error: detail, errors } = parsed.data
  const { code, ...context } = detail ?? { code: 'error' }

  return new ApiError({
    message,
    status,
    code,
    fieldErrors: errors ?? {},
    context,
  })
}

/** Parses a payload, turning schema drift into a clearly attributed error. */
function parse<T>(schema: z.ZodType<T>, payload: unknown, endpoint: string): T {
  const result = schema.safeParse(payload)

  if (!result.success) {
    if (env.isDev) {
      // eslint-disable-next-line no-console
      console.error(`[api] Response from ${endpoint} did not match its schema`, result.error.issues)
    }

    throw new ApiError({
      message: 'The server sent data this app did not understand.',
      status: 500,
      code: 'schema_mismatch',
      context: { endpoint },
    })
  }

  return result.data
}

export const http = {
  /** GET returning a single envelope-wrapped resource. */
  async get<T>(url: string, schema: z.ZodType<T>, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get(url, config)

    return parse(envelope(schema), response.data, `GET ${url}`).data
  },

  /** GET returning a paginated collection. */
  async getPaginated<T>(
    url: string,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig,
  ): Promise<Paginated<T>> {
    const response = await instance.get(url, config)
    const parsed = parse(paginatedEnvelope(schema), response.data, `GET ${url}`)

    return splitMeta(parsed.data, parsed.meta)
  },

  async post<T>(
    url: string,
    body: unknown,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.post(url, body, config)

    return parse(envelope(schema), response.data, `POST ${url}`).data
  },

  async patch<T>(
    url: string,
    body: unknown,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.patch(url, body, config)

    return parse(envelope(schema), response.data, `PATCH ${url}`).data
  },

  async put<T>(
    url: string,
    body: unknown,
    schema: z.ZodType<T>,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await instance.put(url, body, config)

    return parse(envelope(schema), response.data, `PUT ${url}`).data
  },

  /** For endpoints whose success payload carries nothing useful. */
  async command(
    method: 'post' | 'patch' | 'delete' | 'put',
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<void> {
    if (method === 'delete') {
      await instance.delete(url, config)
      return
    }

    await instance[method](url, body ?? {}, config)
  },

  /** Escape hatch for multipart uploads, which must not be JSON-encoded. */
  async upload<T>(url: string, form: FormData, schema: z.ZodType<T>): Promise<T> {
    const response = await instance.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return parse(envelope(schema), response.data, `POST ${url}`).data
  },

  raw: instance,
}

/**
 * Endpoints add their own keys to `meta` alongside the pagination fields.
 * Separating them keeps `Paginated.meta` a stable, typed shape.
 */
function splitMeta<T>(items: T[], meta: Record<string, unknown>): Paginated<T> {
  const {
    current_page,
    last_page,
    per_page,
    total,
    from,
    to,
    ...extra
  } = meta as PaginationMeta & Record<string, unknown>

  return {
    items,
    meta: { current_page, last_page, per_page, total, from, to },
    extra,
  }
}
