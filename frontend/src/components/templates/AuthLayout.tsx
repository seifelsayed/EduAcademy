import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { Logo } from '@/components/atoms/Logo'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight mb-1">{title}</h1>
            {subtitle ? <p className="text-xs sm:text-sm text-text-muted m-0">{subtitle}</p> : null}
          </div>

          {children}
        </div>

        {footer ? <div className="text-center text-xs sm:text-sm text-text-muted">{footer}</div> : null}

        <div className="text-center">
          <Link
            to="/"
            className="text-xs font-bold text-text-muted hover:text-primary transition-colors no-underline"
          >
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
