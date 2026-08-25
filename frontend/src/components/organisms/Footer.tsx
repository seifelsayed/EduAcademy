import { IconArrowLeft, IconArrowRight, IconCheck, IconMail } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { env } from '@/shared/config/env'
import { useTranslation } from '@/shared/lib/i18n'
import { toast } from '@/stores/toastStore'

export function Footer() {
  const [email, setEmail] = useState('')
  const { t, isAr, formatNumber } = useTranslation()

  const linkGroups = [
    {
      title: t('footer.learnSection'),
      links: [
        { label: isAr ? 'دليل الكورسات' : 'Course Catalog', to: '/courses' },
        { label: isAr ? 'دوراتي الحالية' : 'Enrolled Courses', to: '/my-learning' },
        { label: isAr ? 'قائمة الرغبات' : 'Wishlist', to: '/wishlist' },
        { label: isAr ? 'الشهادات المعتمدة' : 'Verified Certificates', to: '/certificates' },
      ],
    },
    {
      title: t('footer.teachSection'),
      links: [
        { label: isAr ? 'لوحة تحكم المدرس' : 'Teacher Dashboard', to: '/teach' },
        { label: isAr ? 'إدارة الكورسات' : 'Manage Courses', to: '/teach/courses' },
        { label: isAr ? 'إنشاء دورة جديدة' : 'Create New Course', to: '/teach/courses/new' },
        { label: isAr ? 'مراجعة الواجبات' : 'Grading Queue', to: '/teach/grading' },
      ],
    },
    {
      title: t('footer.accountSection'),
      links: [
        { label: isAr ? 'لوحة تحكم الطالب' : 'Student Portal', to: '/dashboard' },
        { label: isAr ? 'إعدادات الملف الشخصي' : 'Profile Settings', to: '/settings' },
        { label: isAr ? 'سجل المشتريات' : 'Purchase History', to: '/orders' },
        { label: isAr ? 'التحقق من صحة الشهادة' : 'Certificate Registry', to: '/certificates/verify' },
      ],
    },
  ]

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      toast.success(t('footer.subscribeSuccess'))
      setEmail('')
    }
  }

  const currentYear = formatNumber(new Date().getFullYear())

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto transition-colors">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-text-muted max-w-sm leading-relaxed m-0">
              {t('footer.tagline')}
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-100/90 dark:bg-emerald-950/80 px-3 py-1.5 rounded-full w-fit border border-emerald-300 dark:border-emerald-800 shadow-2xs">
              <IconCheck size={14} className="stroke-[3] text-emerald-700 dark:text-emerald-300 shrink-0" />
              <span className="font-extrabold">{t('footer.badge')}</span>
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-text-main">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-xs sm:text-sm text-text-muted hover:text-primary transition-colors no-underline font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3">
            <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-text-main">
              {t('footer.newsletterTitle')}
            </h4>
            <p className="text-xs text-text-muted leading-relaxed m-0">
              {t('footer.newsletterDesc')}
            </p>
            <form onSubmit={onSubscribe} className="flex flex-col gap-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className={`w-full h-10 px-3 ${isAr ? 'pr-8' : 'pl-8'} rounded-xl bg-surface-muted border border-border text-xs text-text-main placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                />
                <IconMail size={16} className={`absolute ${isAr ? 'right-2.5' : 'left-2.5'} top-3 text-text-subtle pointer-events-none`} />
              </div>
              <Button
                type="submit"
                size="sm"
                fullWidth
                iconRight={isAr ? <IconArrowLeft size={14} /> : <IconArrowRight size={14} />}
              >
                {t('footer.subscribeBtn')}
              </Button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p className="m-0 font-medium">
            {t('footer.copyright', { year: currentYear, appName: env.appName })}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/courses" className="hover:text-primary transition-colors no-underline">
              {t('home.exploreCourses')}
            </Link>
            <span>•</span>
            <Link to="/certificates/verify" className="hover:text-primary transition-colors no-underline">
              {t('footer.verifyCertificate')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
