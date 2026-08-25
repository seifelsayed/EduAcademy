import clsx from 'clsx'
import type { ReactNode } from 'react'

export type StickerType =
  | 'certificate'
  | 'course'
  | 'book'
  | 'graduation'
  | 'trophy'
  | 'ai'
  | 'code'
  | 'design'
  | 'search'
  | 'achievement'
  | 'rocket'
  | 'lightning'
  | 'target'
  | 'growth'

export type StickerTone = 'primary' | 'secondary' | 'accent' | 'emerald' | 'amber'

interface BrandBadgeStickerProps {
  type: StickerType
  label?: string
  tone?: StickerTone
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const TONE_CLASSES: Record<StickerTone, { container: string; iconBg: string; text: string; ring: string }> = {
  primary: {
    container: 'bg-surface/95 dark:bg-surface/95 border-blue-200 dark:border-blue-800/60 shadow-lg',
    iconBg: 'bg-primary text-white shadow-sm shadow-primary/30',
    text: 'text-text-main',
    ring: 'border-primary/30',
  },
  secondary: {
    container: 'bg-surface/95 dark:bg-surface/95 border-purple-200 dark:border-purple-800/60 shadow-lg',
    iconBg: 'bg-secondary text-white shadow-sm shadow-secondary/30',
    text: 'text-text-main',
    ring: 'border-secondary/30',
  },
  accent: {
    container: 'bg-surface/95 dark:bg-surface/95 border-cyan-200 dark:border-cyan-800/60 shadow-lg',
    iconBg: 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30',
    text: 'text-text-main',
    ring: 'border-cyan-600/30',
  },
  emerald: {
    container: 'bg-surface/95 dark:bg-surface/95 border-emerald-200 dark:border-emerald-800/60 shadow-lg',
    iconBg: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30',
    text: 'text-text-main',
    ring: 'border-emerald-600/30',
  },
  amber: {
    container: 'bg-surface/95 dark:bg-surface/95 border-amber-200 dark:border-amber-800/60 shadow-lg',
    iconBg: 'bg-amber-600 text-white shadow-sm shadow-amber-600/30',
    text: 'text-text-main',
    ring: 'border-amber-600/30',
  },
}

const STICKER_ICONS: Record<StickerType, { svg: ReactNode; defaultTone: StickerTone; defaultLabel: string }> = {
  certificate: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M7 8h10M7 12h6" />
        <circle cx="17" cy="15" r="2" />
      </svg>
    ),
    defaultTone: 'emerald',
    defaultLabel: 'شهادة معتمدة',
  },
  course: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <polygon points="10,8 16,11.5 10,15" fill="currentColor" />
      </svg>
    ),
    defaultTone: 'primary',
    defaultLabel: 'دورة تفاعلية',
  },
  book: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    defaultTone: 'secondary',
    defaultLabel: 'مكتبة شاملة',
  },
  graduation: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
    defaultTone: 'secondary',
    defaultLabel: 'تخرج واعتماد',
  },
  trophy: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4" />
        <path d="M4 5h16v6a6 6 0 0 1-12 0V5zM12 17v4M8 21h8" />
      </svg>
    ),
    defaultTone: 'amber',
    defaultLabel: 'إنجاز متميز',
  },
  ai: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    defaultTone: 'accent',
    defaultLabel: 'ذكاء اصطناعي',
  },
  code: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    defaultTone: 'primary',
    defaultLabel: 'برمجة وتطبيق',
  },
  design: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    defaultTone: 'secondary',
    defaultLabel: 'تصميم واجهات',
  },
  search: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    defaultTone: 'primary',
    defaultLabel: 'بحث واستكشاف',
  },
  achievement: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    defaultTone: 'emerald',
    defaultLabel: 'وسام تقدير',
  },
  rocket: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
    defaultTone: 'accent',
    defaultLabel: 'انطلاقة سريعة',
  },
  lightning: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    defaultTone: 'amber',
    defaultLabel: 'أداء فائق',
  },
  target: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    defaultTone: 'primary',
    defaultLabel: 'أهداف واضحة',
  },
  growth: {
    svg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    defaultTone: 'emerald',
    defaultLabel: 'تطور مهني',
  },
}

export function BrandBadgeSticker({
  type,
  label,
  tone,
  size = 'md',
  className = '',
}: BrandBadgeStickerProps) {
  const item = STICKER_ICONS[type]
  const effectiveTone = tone ?? item.defaultTone
  const style = TONE_CLASSES[effectiveTone]
  const textLabel = label ?? item.defaultLabel

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border backdrop-blur-md transition-transform hover:scale-105 select-none shadow-md',
        style.container,
        size === 'sm' && 'text-xs px-3 py-1.5',
        size === 'lg' && 'text-sm px-4.5 py-2.5',
        className,
      )}
    >
      <div className={clsx('w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs', style.iconBg)}>
        {item.svg}
      </div>
      <span className={clsx('font-black text-xs sm:text-sm tracking-tight', style.text)}>{textLabel}</span>
    </div>
  )
}
