import { useUiStore } from '@/stores/uiStore'
import { arTranslations } from './ar'
import { enTranslations } from './en'
import type { AppLanguage, TranslationDictionary } from './types'
import {
  formatCompact,
  formatDate,
  formatDuration,
  formatMoney,
  formatNumber,
  formatPercent,
  formatPlural,
  formatPrice,
  formatRelative,
  toArabicIndicDigits,
} from './numerals'

export * from './types'
export * from './numerals'
export * from './localizeError'


const dictionaries: Record<AppLanguage, TranslationDictionary> = {
  ar: arTranslations,
  en: enTranslations,
}

/**
 * Access nested translation key using dot notation (e.g. "home.heroTitlePrefix")
 */
export function t(key: string, params?: Record<string, any>, lang?: AppLanguage): string {
  const activeLang = lang ?? useUiStore.getState().language ?? 'ar'
  const dict = dictionaries[activeLang] ?? dictionaries.ar

  const parts = key.split('.')
  let current: any = dict

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      // Fallback to key or fallback to opposite language dictionary
      const fallbackDict = dictionaries.en
      let fallbackCurrent: any = fallbackDict
      for (const p of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && p in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[p]
        } else {
          fallbackCurrent = undefined
          break
        }
      }
      current = fallbackCurrent ?? key
      break
    }
  }

  if (typeof current !== 'string') {
    return key
  }

  let result = current
  if (params) {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal))
    }
  }

  return result
}

/**
 * Primary React Hook for UI Translation and Locale Helpers
 */
export function useTranslation() {
  const language = useUiStore((s) => s.language)
  const setLanguage = useUiStore((s) => s.setLanguage)
  const toggleLanguage = useUiStore((s) => s.toggleLanguage)

  const isAr = language === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  return {
    language,
    isAr,
    dir,
    setLanguage,
    toggleLanguage,
    t: (key: string, params?: Record<string, any>) => t(key, params, language),
    tPlural: (count: number, itemKey: keyof typeof arTranslations.plurals) =>
      formatPlural(count, itemKey, language),
    formatNumber: (value: number) => formatNumber(value, language),
    formatPercent: (value: number, decimals?: number) => formatPercent(value, decimals, language),
    formatMoney: (cents: number, currency?: string) => formatMoney(cents, currency, language),
    formatPrice: (price: { effective_cents: number; currency: string; is_free: boolean }) =>
      formatPrice(price, language),
    formatDuration: (minutes: number) => formatDuration(minutes, language),
    formatCompact: (value: number) => formatCompact(value, language),
    formatDate: (value: string | Date | null | undefined, pattern?: string) =>
      formatDate(value, pattern, language),
    formatRelative: (value: string | Date | null | undefined) => formatRelative(value, language),
    toArabicIndicDigits,
  }
}
