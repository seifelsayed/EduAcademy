import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Checkbox, Input } from '@/components/atoms/inputs'
import { FormField } from '@/components/molecules/FormField'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { isApiError } from '@/core/domain/errors/ApiError'
import { loginFormSchema, type LoginForm, type LoginFormInput } from '@/core/domain/schemas/forms'
import { useLogin } from '@/features/auth/hooks'
import { useTranslation } from '@/shared/lib/i18n'

export function LoginPage() {
  const login = useLogin()
  const { t, isAr } = useTranslation()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '', remember: false },
  })

  const serverError =
    login.error && isApiError(login.error) && !login.error.isValidationError
      ? login.error.message
      : null

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', 'password')
  }

  return (
    <AuthLayout
      title={t('auth.loginTitle')}
      subtitle={t('auth.loginSubtitle')}
      footer={
        <>
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            {t('navigation.register')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit((values) => login.mutate(values))} noValidate className="flex flex-col">
        {serverError ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-4" role="alert">
            {serverError}
          </div>
        ) : null}

        <FormField label={t('auth.emailLabel')} error={errors.email?.message} required>
          <Input
            type="email"
            autoComplete="email"
            placeholder={t('auth.emailPlaceholder')}
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label={t('auth.passwordLabel')} error={errors.password?.message} required>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder={t('auth.passwordPlaceholder')}
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <div className="mb-4">
          <Checkbox label={t('auth.rememberMe')} {...register('remember')} />
        </div>

        <Button type="submit" fullWidth size="md" loading={login.isPending}>
          {t('auth.signInBtn')}
        </Button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
          {isAr ? 'حسابات تجريبية سريعة' : 'Quick Demo Accounts'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          className="p-2.5 rounded-xl bg-surface-muted hover:bg-primary-light hover:text-primary hover:border-primary/30 border border-border text-xs font-bold text-text-main transition-colors cursor-pointer active:scale-95 shadow-2xs"
          onClick={() => fillDemo('student@education.test')}
        >
          {isAr ? 'طالب' : 'Student'}
        </button>
        <button
          type="button"
          className="p-2.5 rounded-xl bg-surface-muted hover:bg-primary-light hover:text-primary hover:border-primary/30 border border-border text-xs font-bold text-text-main transition-colors cursor-pointer active:scale-95 shadow-2xs"
          onClick={() => fillDemo('instructor@education.test')}
        >
          {isAr ? 'مدرس' : 'Teacher'}
        </button>
        <button
          type="button"
          className="p-2.5 rounded-xl bg-surface-muted hover:bg-primary-light hover:text-primary hover:border-primary/30 border border-border text-xs font-bold text-text-main transition-colors cursor-pointer active:scale-95 shadow-2xs"
          onClick={() => fillDemo('admin@education.test')}
        >
          {isAr ? 'إدارة' : 'Admin'}
        </button>
      </div>
    </AuthLayout>
  )
}
