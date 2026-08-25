import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/components/atoms/Button'
import { env } from '@/shared/config/env'
import { localizeErrorMessage } from '@/shared/lib/i18n/localizeError'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (env.isDev) {
      // eslint-disable-next-line no-console
      console.error('Unhandled render error', error, info.componentStack)
    }
  }

  private isArabic(): boolean {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('lang') === 'ar' || document.documentElement.getAttribute('dir') === 'rtl'
    }
    return true
  }

  override render(): ReactNode {
    const { error } = this.state

    if (!error) return this.props.children

    const isAr = this.isArabic()

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-danger-light border border-danger/30 flex items-center justify-center text-danger mb-4 shadow-xs">
            <IconAlertTriangle size={30} />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight mb-2">
            {isAr ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mb-5 leading-relaxed">
            {isAr
              ? 'واجه التطبيق مشكلة غير متوقعة أثناء معالجة الصفحة. عادةً ما يساعد تحديث الصفحة في حل المشكلة فوراً.'
              : 'The application encountered an unexpected error. Reloading the page usually resolves it.'}
          </p>

          {env.isDev && error.message ? (
            <pre className="text-start text-xs font-mono bg-surface-muted p-3.5 rounded-2xl overflow-auto w-full max-h-40 text-danger border border-border mb-5">
              {localizeErrorMessage(error.message, isAr ? 'ar' : 'en')}
            </pre>
          ) : null}

          <div className="flex items-center gap-3 w-full justify-center">
            <Button
              size="sm"
              icon={<IconRefresh size={15} />}
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
            >
              {isAr ? 'إعادة تحميل الصفحة' : 'Reload Page'}
            </Button>

            <a href="/" className="no-underline">
              <Button size="sm" variant="ghost" icon={<IconHome size={15} />}>
                {isAr ? 'الرئيسية' : 'Homepage'}
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }
}

