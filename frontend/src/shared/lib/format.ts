/**
 * Locale-aware formatting utilities. Re-exports and integrates with our central i18n system.
 */
export {
  formatMoney,
  formatPrice,
  formatDuration,
  formatClock,
  formatDate,
  formatRelative,
  formatNumber,
  formatCompact,
  formatPercent,
  formatPlural,
  toArabicIndicDigits,
} from './i18n'

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
