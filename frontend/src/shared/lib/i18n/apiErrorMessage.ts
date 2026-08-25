import { isApiError } from '@/core/domain/errors/ApiError'

import { t } from './index'
import { localizeErrorMessage } from './localizeError'

/** Snake_case with no spaces means it is a dictionary key, not a sentence. */
function looksLikeCode(value: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(value)
}

/** Resolves a dictionary key, or returns null when the key is absent. */
function translateCode(code: string): string | null {
  const key = `apiErrors.${code}`
  const value = t(key)

  // `t()` echoes the key back when nothing matches.
  return value === key ? null : value
}

/**
 * Turns a thrown value into a message in the user's language.
 *
 * Resolution order matters:
 *
 *  1. The API's `error.code` — a stable contract both languages have a phrase
 *     for. This is the step that makes English work too: matching on the
 *     server's English wording alone left English users reading raw framework
 *     strings like "CSRF token mismatch".
 *  2. The first field-validation message, which is more specific than a
 *     generic "some fields need attention".
 *  3. The server's own message, run through the legacy text translator.
 *  4. The caller's fallback — either a dictionary code or a literal sentence.
 */
export function apiErrorMessage(error: unknown, fallback = 'unknown'): string {
  const resolveFallback = (): string => {
    if (looksLikeCode(fallback)) {
      return translateCode(fallback) ?? t('apiErrors.unknown')
    }

    // Callers written before code-based errors pass an English sentence.
    return localizeErrorMessage(fallback)
  }

  if (!isApiError(error)) {
    if (error instanceof Error && error.message) {
      return localizeErrorMessage(error.message)
    }

    return resolveFallback()
  }

  if (error.isNetworkError) {
    return t('apiErrors.network_error')
  }

  // A validation failure carries the useful detail in `errors`, not the summary.
  if (error.isValidationError) {
    const firstField = Object.values(error.fieldErrors)[0]?.[0]

    if (firstField) {
      return localizeErrorMessage(firstField)
    }
  }

  const byCode = translateCode(error.code)

  if (byCode !== null) {
    return byCode
  }

  return error.message ? localizeErrorMessage(error.message) : resolveFallback()
}
