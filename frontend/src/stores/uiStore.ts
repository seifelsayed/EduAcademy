import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '@/shared/config/env'

export type ThemeMode = 'light' | 'dark'
export type AppLanguage = 'ar' | 'en'

interface UiState {
  theme: ThemeMode
  language: AppLanguage
  isSidebarOpen: boolean

  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  setLanguage: (lang: AppLanguage) => void
  toggleLanguage: () => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.setAttribute('data-bs-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function applyLanguage(lang: AppLanguage): void {
  document.documentElement.setAttribute('lang', lang)
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  if (lang === 'ar') {
    document.documentElement.classList.add('lang-ar')
    document.documentElement.classList.remove('lang-en')
  } else {
    document.documentElement.classList.add('lang-en')
    document.documentElement.classList.remove('lang-ar')
  }
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'ar',
      isSidebarOpen: false,

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },

      toggleTheme: () => get().setTheme(get().theme === 'light' ? 'dark' : 'light'),

      setLanguage: (language) => {
        applyLanguage(language)
        set({ language })
      },

      toggleLanguage: () => get().setLanguage(get().language === 'ar' ? 'en' : 'ar'),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: STORAGE_KEYS.theme,
      partialize: (state) => ({ theme: state.theme, language: state.language }),
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.theme ?? 'light')
        applyLanguage(state?.language ?? 'ar')
      },
    },
  ),
)

export const useTheme = (): ThemeMode => useUiStore((state) => state.theme)
export const useLanguage = (): AppLanguage => useUiStore((state) => state.language)
