/**
 * Text normalisation for catalogue search.
 *
 * Handles null/undefined, trims, collapses whitespace, lowercases Latin text,
 * strips Arabic diacritics/tatweel, and unifies the common multi-form Arabic
 * letters (أ/إ/آ → ا، ة → ه، ى → ي) so "أمن" matches "الأمن" and
 * "امن الشبكات" alike. Safe to call with any value.
 */
export function normalizeSearchText(value: unknown): string {
  if (value === null || value === undefined) return ''

  return String(value)
    .normalize('NFKC')
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u200c-\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

/** Every whitespace-separated term must appear somewhere in the haystack. */
export function matchesSearch(haystack: string | null | undefined, search: string): boolean {
  const needle = normalizeSearchText(search)

  if (needle === '') return true

  const normalizedHaystack = normalizeSearchText(haystack)

  return needle.split(' ').every((term) => normalizedHaystack.includes(term))
}

/** Concatenates a record's searchable values into one haystack, skipping empties. */
export function buildSearchHaystack(values: Array<string | null | undefined>): string {
  return normalizeSearchText(
    values.filter((value) => typeof value === 'string' && value.trim() !== '').join(' '),
  )
}
