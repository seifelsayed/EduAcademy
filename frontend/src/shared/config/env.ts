/**
 * Runtime configuration, read once and typed. Vite inlines `import.meta.env`
 * at build time, so these are constants in the bundle.
 */

const rawApiUrl = import.meta.env.VITE_API_URL ?? '/api/v1'

export const env = {
  /** Base URL for API calls. Defaults to the dev-server proxy path. */
  apiUrl: rawApiUrl.replace(/\/$/, ''),

  appName: import.meta.env.VITE_APP_NAME ?? 'Education Platform',

  /** Currency used when the API does not supply one with an amount. */
  defaultCurrency: import.meta.env.VITE_CURRENCY ?? 'EGP',

  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const

export const STORAGE_KEYS = {
  token: 'edu.auth.token',
  theme: 'edu.ui.theme',
  recentSearches: 'edu.ui.recent-searches',
} as const
