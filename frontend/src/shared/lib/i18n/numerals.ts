import { formatDistanceToNowStrict, format, parseISO } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

import { env } from '@/shared/config/env'
import { useUiStore } from '@/stores/uiStore'
import { arTranslations } from './ar'
import { enTranslations } from './en'
import type { AppLanguage } from './types'

const ARABIC_INDIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

export function toArabicIndicDigits(str: string | number): string {
  return String(str)
    .replace(/[0-9]/g, (digit) => ARABIC_INDIC_DIGITS[parseInt(digit, 10)] ?? digit)
    .replace(/%/g, '٪')
}

function getActiveLanguage(lang?: AppLanguage): AppLanguage {
  if (lang) return lang
  return useUiStore.getState().language ?? 'ar'
}

/**
 * Format numbers according to active locale:
 * Arabic -> Arabic-Indic (e.g. ٥٠٬٠٠٠)
 * English -> Latin (e.g. 50,000)
 */
export function formatNumber(value: number, lang?: AppLanguage): string {
  const language = getActiveLanguage(lang)
  const formattedLatin = new Intl.NumberFormat('en-US').format(value)

  if (language === 'ar') {
    return toArabicIndicDigits(formattedLatin).replace(/,/g, '٬')
  }

  return formattedLatin
}

/**
 * Percentage formatting (e.g. 0.95 -> 95% / ٩٥٪ in Arabic)
 */
export function formatPercent(value: number, decimals = 0, lang?: AppLanguage): string {
  const language = getActiveLanguage(lang)
  const normalized = value > 0 && value <= 1.0 ? value * 100 : value
  const numStr = normalized.toFixed(decimals)

  if (language === 'ar') {
    return `${toArabicIndicDigits(numStr)}٪`
  }

  return `${numStr}%`
}

/**
 * Money formatting (cents to formatted currency)
 */
export function formatMoney(
  cents: number,
  currency: string = env.defaultCurrency,
  lang?: AppLanguage,
): string {
  const language = getActiveLanguage(lang)
  const amount = cents / 100
  const isWhole = cents % 100 === 0

  // Standardize platform currency to EGP
  const effectiveCurrency = currency === 'USD' || currency === '$' || !currency ? 'EGP' : currency

  if (language === 'ar') {
    const formattedNum = isWhole
      ? formatNumber(amount, 'ar')
      : formatNumber(Math.floor(amount), 'ar') + '٫' + toArabicIndicDigits(String(cents % 100).padStart(2, '0'))

    if (effectiveCurrency === 'EGP' || effectiveCurrency === 'ج.م') {
      return `${formattedNum} ج.م.`
    }

    const formatted = new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: effectiveCurrency,
      minimumFractionDigits: isWhole ? 0 : 2,
    }).format(amount)

    return toArabicIndicDigits(formatted)
  }

  if (effectiveCurrency === 'EGP') {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: isWhole ? 0 : 2 }).format(amount)} EGP`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: effectiveCurrency,
    minimumFractionDigits: isWhole ? 0 : 2,
  }).format(amount)
}

export function formatPrice(
  price: { effective_cents: number; currency: string; is_free: boolean },
  lang?: AppLanguage,
): string {
  const language = getActiveLanguage(lang)
  if (price.is_free) {
    return language === 'ar' ? 'مجاناً' : 'Free'
  }
  return formatMoney(price.effective_cents, price.currency, language)
}

/**
 * Duration formatter (e.g. "4h 25m" or "٤ ساعات و ٢٥ دقيقة")
 */
export function formatDuration(minutes: number, lang?: AppLanguage): string {
  if (!minutes || minutes <= 0) return '—'

  const language = getActiveLanguage(lang)
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60

  if (language === 'ar') {
    if (hours === 0) return `${formatNumber(remainingMins, 'ar')} دقيقة`
    if (remainingMins === 0) return `${formatNumber(hours, 'ar')} س`
    return `${formatNumber(hours, 'ar')} س ${formatNumber(remainingMins, 'ar')} د`
  }

  if (hours === 0) return `${remainingMins}m`
  if (remainingMins === 0) return `${hours}h`
  return `${hours}h ${remainingMins}m`
}

/**
 * Compact numbers (12_400 -> "12.4k" / "١٢٫٤ ألف")
 */
export function formatCompact(value: number, lang?: AppLanguage): string {
  const language = getActiveLanguage(lang)

  if (language === 'ar') {
    if (value >= 1_000_000) {
      const formatted = (value / 1_000_000).toFixed(1).replace(/\.0$/, '')
      return `${formatNumber(parseFloat(formatted), 'ar')} مليون`
    }
    if (value >= 1_000) {
      const formatted = (value / 1_000).toFixed(1).replace(/\.0$/, '')
      return `${formatNumber(parseFloat(formatted), 'ar')}k`
    }
    return formatNumber(value, 'ar')
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
  const ss = String(seconds).padStart(2, '0')

  const formatted = hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
  return formatted
}

export function formatDate(
  value: string | Date | null | undefined,
  pattern = 'd MMM yyyy',
  lang?: AppLanguage,
): string {
  if (!value) return '—'

  const language = getActiveLanguage(lang)
  const dateObj = typeof value === 'string' ? parseISO(value) : value

  try {
    const formatted = format(dateObj, pattern, {
      locale: language === 'ar' ? ar : enUS,
    })
    return language === 'ar' ? toArabicIndicDigits(formatted) : formatted
  } catch {
    return '—'
  }
}

export function formatRelative(value: string | Date | null | undefined, lang?: AppLanguage): string {
  if (!value) return '—'

  const language = getActiveLanguage(lang)
  const dateObj = typeof value === 'string' ? parseISO(value) : value

  try {
    return formatDistanceToNowStrict(dateObj, {
      addSuffix: true,
      locale: language === 'ar' ? ar : enUS,
    })
  } catch {
    return '—'
  }
}

export function formatPlural(
  count: number,
  itemKey: keyof typeof arTranslations.plurals,
  lang?: AppLanguage,
): string {
  const language = getActiveLanguage(lang)
  const countStr = formatNumber(count, language)

  if (language === 'ar') {
    const rule = arTranslations.plurals[itemKey]
    if (count === 0) return rule.zero
    if (count === 1) return rule.one
    if (count === 2) return rule.two
    if (count >= 3 && count <= 10) return rule.few.replace('{count}', countStr)
    return rule.many.replace('{count}', countStr)
  }

  const rule = enTranslations.plurals[itemKey]
  if (count === 1) return rule.one
  return rule.other.replace('{count}', countStr)
}
